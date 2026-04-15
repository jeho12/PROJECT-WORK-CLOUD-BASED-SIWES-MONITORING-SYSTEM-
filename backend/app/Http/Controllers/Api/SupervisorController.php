<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogbookWeek;
use App\Models\WeeklyReport;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function dashboard(Request $request)
    {
        $supervisor = $request->user();

        $students = $supervisor->supervisedStudents()
            ->with('user')
            ->get();

        $submittedWeeks = LogbookWeek::whereHas('user.studentProfile', function ($query) use ($supervisor) {
                $query->where('supervisor_id', $supervisor->id);
            })
            ->where('status', 'submitted')
            ->with(['user.studentProfile', 'weeklyReport'])
            ->latest()
            ->get();

        return response()->json([
            'students' => $students,
            'submitted_weeks' => $submittedWeeks,
        ]);
    }

    public function submittedWeekDetails(Request $request, $weekId)
    {
        $supervisor = $request->user();

        $week = LogbookWeek::where('id', $weekId)
            ->whereHas('user.studentProfile', function ($query) use ($supervisor) {
                $query->where('supervisor_id', $supervisor->id);
            })
            ->with([
                'user.studentProfile',
                'days.attachments',
                'weeklyReport',
            ])
            ->firstOrFail();

        return response()->json([
            'week' => $week,
        ]);
    }

    public function reviewWeek(Request $request, $weekId)
    {
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
            'status' => $validated['review_status'] === 'approved' ? 'approved' : 'rejected',
        ]);

        return response()->json([
            'message' => $validated['review_status'] === 'approved'
                ? 'Weekly report approved successfully.'
                : 'Weekly report rejected successfully.',
            'week' => $week->fresh('weeklyReport'),
        ]);
    }
}