<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogbookWeek;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function dashboard(Request $request)
    {
        if (!$request->user()->hasRole('supervisor')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $supervisor = $request->user();

        $students = $supervisor->supervisedStudents()
            ->with('user')
            ->get();

        $submittedWeeks = LogbookWeek::whereHas('user.studentProfile', function ($query) use ($supervisor) {
                $query->where('supervisor_id', $supervisor->id);
            })
            ->whereIn('status', ['submitted', 'approved', 'rejected'])
            ->with([
                'user.studentProfile',
                'weeklyReport',
            ])
            ->latest('week_start_date')
            ->get();

        return response()->json([
            'students' => $students,
            'submitted_weeks' => $submittedWeeks,
        ]);
    }

    public function studentWeeks(Request $request, $studentId)
    {
        if (!$request->user()->hasRole('supervisor')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $supervisor = $request->user();

        $weeks = LogbookWeek::where('user_id', $studentId)
            ->whereHas('user.studentProfile', function ($query) use ($supervisor) {
                $query->where('supervisor_id', $supervisor->id);
            })
            ->with([
                'weeklyReport',
                'days.attachments',
                'days.attendanceLog',
            ])
            ->latest('week_start_date')
            ->get();

        return response()->json([
            'weeks' => $weeks,
        ]);
    }

    public function submittedWeekDetails(Request $request, $weekId)
    {
        if (!$request->user()->hasRole('supervisor')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $supervisor = $request->user();

        $week = LogbookWeek::where('id', $weekId)
            ->whereHas('user.studentProfile', function ($query) use ($supervisor) {
                $query->where('supervisor_id', $supervisor->id);
            })
            ->with([
                'user.studentProfile',
                'days.attachments',
                'days.attendanceLog',
                'weeklyReport',
            ])
            ->firstOrFail();

        return response()->json([
            'week' => $week,
        ]);
    }

    public function reviewWeek(Request $request, $weekId)
    {
        if (!$request->user()->hasRole('supervisor')) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $supervisor = $request->user();

        $validated = $request->validate([
            'review_status' => ['required', 'in:approved,rejected'],
            'supervisor_comment' => ['nullable', 'string'],
            'supervisor_name' => ['nullable', 'string', 'max:255'],
            'supervisor_rank' => ['nullable', 'string', 'max:255'],
        ]);

        $week = LogbookWeek::where('id', $weekId)
            ->whereHas('user.studentProfile', function ($query) use ($supervisor) {
                $query->where('supervisor_id', $supervisor->id);
            })
            ->with('weeklyReport')
            ->firstOrFail();

        if (!$week->weeklyReport) {
            return response()->json([
                'message' => 'No weekly report found for this submission.',
            ], 422);
        }

        $week->weeklyReport->update([
            'review_status' => $validated['review_status'],
            'reviewed_by' => $supervisor->id,
            'supervisor_comment' => $validated['supervisor_comment'] ?? null,
            'supervisor_name' => $validated['supervisor_name'] ?? $supervisor->name,
            'supervisor_rank' => $validated['supervisor_rank'] ?? null,
            'approved_at' => $validated['review_status'] === 'approved' ? now() : null,
        ]);

        $week->update([
            'status' => $validated['review_status'],
        ]);

       return response()->json([
    'message' => $validated['review_status'] === 'approved'
        ? 'Weekly report approved successfully.'
        : 'Weekly report rejected successfully.',
    'week' => $week->fresh([
        'user.studentProfile',
        'days.attachments',
        'days.attendanceLog',
        'weeklyReport',
    ]),
]);
    }
}