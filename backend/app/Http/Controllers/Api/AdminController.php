<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $students = StudentProfile::with(['user', 'supervisor'])
            ->latest()
            ->get();

        return response()->json([
            'students' => $students,
        ]);
    }

    public function supervisors(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $supervisors = User::role('supervisor')->get();

        return response()->json([
            'supervisors' => $supervisors,
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