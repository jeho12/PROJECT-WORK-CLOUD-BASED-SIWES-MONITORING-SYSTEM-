<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogbookWeek;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return null;
    }

    public function dashboard(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $totalStudents = User::role('student')->count();
        $totalSupervisors = User::role('supervisor')->count();
        $submittedWeeks = LogbookWeek::whereIn('status', ['submitted', 'approved', 'rejected'])->count();
        $pendingWeeks = LogbookWeek::where('status', 'submitted')->count();

        $activeStudents = StudentProfile::whereNotNull('organization_name')->count();
        $inactiveStudents = max($totalStudents - $activeStudents, 0);

        return response()->json([
            'stats' => [
                'total_students' => $totalStudents,
                'total_supervisors' => $totalSupervisors,
                'submitted_weeks' => $submittedWeeks,
                'pending_reviews' => $pendingWeeks,
                'active_students' => $activeStudents,
                'inactive_students' => $inactiveStudents,
            ],
        ]);
    }

    public function createSupervisor(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('supervisor');

        return response()->json([
            'message' => 'Supervisor created successfully.',
            'user' => $user,
        ]);
    }

    public function students(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $students = StudentProfile::with(['user.roles', 'supervisor'])
            ->latest()
            ->get()
            ->map(function ($student) {
                $submittedCount = LogbookWeek::where('user_id', $student->user_id)
                    ->whereIn('status', ['submitted', 'approved', 'rejected'])
                    ->count();

                $pendingCount = LogbookWeek::where('user_id', $student->user_id)
                    ->where('status', 'submitted')
                    ->count();

                return [
                    'id' => $student->id,
                    'user_id' => $student->user_id,
                    'name' => $student->user?->name,
                    'email' => $student->user?->email,
                    'matric_number' => $student->matric_number,
                    'department' => $student->department,
                    'faculty' => $student->faculty,
                    'level' => $student->level,
                    'organization_name' => $student->organization_name,
                    'supervisor_id' => $student->supervisor_id,
                    'supervisor' => $student->supervisor ? [
                        'id' => $student->supervisor->id,
                        'name' => $student->supervisor->name,
                        'email' => $student->supervisor->email,
                    ] : null,
                    'is_active' => !empty($student->organization_name),
                    'submitted_weeks_count' => $submittedCount,
                    'pending_reviews_count' => $pendingCount,
                ];
            })
            ->values();

        return response()->json([
            'students' => $students,
        ]);
    }

    public function supervisors(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $supervisors = User::role('supervisor')
            ->get()
            ->map(function ($supervisor) {
                $assignedCount = StudentProfile::where('supervisor_id', $supervisor->id)->count();

                $pendingReviews = LogbookWeek::whereHas('user.studentProfile', function ($query) use ($supervisor) {
                        $query->where('supervisor_id', $supervisor->id);
                    })
                    ->where('status', 'submitted')
                    ->count();

                $reviewedCount = LogbookWeek::whereHas('user.studentProfile', function ($query) use ($supervisor) {
                        $query->where('supervisor_id', $supervisor->id);
                    })
                    ->whereIn('status', ['approved', 'rejected'])
                    ->count();

                return [
                    'id' => $supervisor->id,
                    'name' => $supervisor->name,
                    'email' => $supervisor->email,
                    'assigned_students_count' => $assignedCount,
                    'pending_reviews_count' => $pendingReviews,
                    'reviewed_weeks_count' => $reviewedCount,
                ];
            })
            ->values();

        return response()->json([
            'supervisors' => $supervisors,
        ]);
    }

    public function toggleUserStatus(Request $request, $userId)
{
    if ($response = $this->checkAdmin($request)) {
        return $response;
    }

    $user = User::findOrFail($userId);

    $user->update([
        'is_active' => !$user->is_active,
    ]);

    return response()->json([
        'message' => $user->is_active
            ? 'User activated successfully.'
            : 'User deactivated successfully.',
        'user' => $user,
    ]);
}


public function resetStudentProgress(Request $request, $studentId)
{
    if ($response = $this->checkAdmin($request)) {
        return $response;
    }

    $student = User::findOrFail($studentId);

    // delete logbook data
    \DB::table('logbook_days')->whereIn('logbook_week_id', function ($q) use ($studentId) {
        $q->select('id')->from('logbook_weeks')->where('user_id', $studentId);
    })->delete();

    \DB::table('logbook_weeks')->where('user_id', $studentId)->delete();

    \DB::table('weekly_reports')->where('student_id', $studentId)->delete();

    \DB::table('attendances')->where('student_id', $studentId)->delete();

    return response()->json([
        'message' => 'Student progress reset successfully.',
    ]);
}
    public function assignSupervisor(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'student_profile_id' => ['required', 'integer', 'exists:student_profiles,id'],
            'supervisor_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $supervisor = User::findOrFail($validated['supervisor_id']);

        if (!$supervisor->hasRole('supervisor')) {
            return response()->json([
                'message' => 'Selected user is not a supervisor.',
            ], 422);
        }

        $profile = StudentProfile::findOrFail($validated['student_profile_id']);

        $profile->update([
            'supervisor_id' => $supervisor->id,
        ]);

        return response()->json([
            'message' => 'Supervisor assigned successfully.',
            'student' => $profile->fresh(['user', 'supervisor']),
        ]);
    }
}