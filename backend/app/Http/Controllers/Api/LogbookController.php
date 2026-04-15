<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogbookDay;
use App\Models\LogbookWeek;
use App\Models\WeeklyReport;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    public function today(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $dayName = strtolower($today->format('l'));

       $allowedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        if (!in_array($dayName, $allowedDays)) {
            return response()->json([
                'message' => 'You can only submit logbook entries from Monday to Friday.',
                'today' => $today->toDateString(),
                'day_name' => $dayName,
                'can_submit' => false,
            ]);
        }

        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $today->copy()->startOfWeek(Carbon::MONDAY)->addDays(5);

        $week = LogbookWeek::firstOrCreate(
            [
                'user_id' => $user->id,
                'week_start_date' => $weekStart->toDateString(),
                'week_end_date' => $weekEnd->toDateString(),
            ],
            [
                'status' => 'ongoing',
            ]
        );

        $todayEntry = LogbookDay::where('logbook_week_id', $week->id)
            ->whereDate('date', $today->toDateString())
            ->first();

       $week->load('days.attachments', 'days.attendanceLog', 'weeklyReport');

        return response()->json([
            'today' => $today->toDateString(),
            'day_name' => $dayName,
            'can_submit' => true,
            'week' => $week,
            'today_entry' => $todayEntry,
        ]);
    }

    public function storeToday(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $dayName = strtolower($today->format('l'));
        $now = Carbon::now();

       $allowedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        if (!in_array($dayName, $allowedDays)) {
            return response()->json([
                'message' => 'Logbook entries are only available from Monday to Friday.',
            ], 422);
        }

        if ($now->hour === 23 && $now->minute > 59) {
            return response()->json([
                'message' => 'Submission window for today has closed.',
            ], 422);
        }

        $validated = $request->validate([
            'time_in' => ['nullable', 'date_format:H:i'],
            'time_out' => ['nullable', 'date_format:H:i', 'after:time_in'],
            'activity' => ['required', 'string'],
        ]);

        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $today->copy()->startOfWeek(Carbon::MONDAY)->addDays(5);

        $week = LogbookWeek::firstOrCreate(
            [
                'user_id' => $user->id,
                'week_start_date' => $weekStart->toDateString(),
                'week_end_date' => $weekEnd->toDateString(),
            ],
            [
                'status' => 'ongoing',
            ]
        );

        if (in_array($week->status, ['submitted', 'approved'])) {
            return response()->json([
                'message' => 'This week has already been submitted and can no longer be edited.',
            ], 422);
        }

        $existing = LogbookDay::where('logbook_week_id', $week->id)
            ->whereDate('date', $today->toDateString())
            ->first();

        if ($existing && $existing->locked) {
            return response()->json([
                'message' => 'Today’s entry is locked and cannot be edited.',
            ], 422);
        }

        $entry = LogbookDay::updateOrCreate(
            [
                'logbook_week_id' => $week->id,
                'date' => $today->toDateString(),
            ],
            [
                'day_name' => ucfirst($dayName),
                'time_in' => $validated['time_in'] ?? null,
                'time_out' => $validated['time_out'] ?? null,
                'activity' => $validated['activity'],
                'locked' => false,
            ]
        );

        $daysCount = LogbookDay::where('logbook_week_id', $week->id)->count();

        if ($daysCount >= 5 && $week->status === 'ongoing') {
            $week->update(['status' => 'completed']);
        }

        return response()->json([
            'message' => 'Today’s log saved successfully.',
            'entry' => $entry,
            'week_status' => $week->fresh()->status,
        ]);
    }

    public function weeklyReport(Request $request, $weekId)
    {
        $user = $request->user();

        $week = LogbookWeek::where('id', $weekId)
            ->where('user_id', $user->id)
            ->with('days.attachments', 'days.attendanceLog', 'weeklyReport')
            ->firstOrFail();

        return response()->json([
            'week' => $week,
            'report' => $week->weeklyReport,
           'can_submit_weekly_report' => $week->days()->count() >= 5,
        ]);
    }

    public function saveWeeklyReport(Request $request, $weekId)
    {
        $user = $request->user();

        $week = LogbookWeek::where('id', $weekId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($week->days()->count() < 5) {
            return response()->json([
                'message' => 'Complete all required daily entries from Monday to Friday before saving weekly report.',
            ], 422);
        }

        if (in_array($week->status, ['submitted', 'approved'])) {
            return response()->json([
                'message' => 'This week has already been submitted and cannot be edited.',
            ], 422);
        }

        $validated = $request->validate([
            'projects' => ['nullable', 'string'],
            'section_department' => ['nullable', 'string', 'max:255'],
            'student_comment' => ['nullable', 'string'],
            'work_done' => ['required', 'string'],
        ]);

        $report = WeeklyReport::updateOrCreate(
            ['logbook_week_id' => $week->id],
            $validated
        );

        return response()->json([
            'message' => 'Weekly report saved successfully.',
            'report' => $report,
        ]);
    }

    public function submitWeek(Request $request, $weekId)
    {
        $user = $request->user();

        $week = LogbookWeek::where('id', $weekId)
            ->where('user_id', $user->id)
            ->with('days', 'weeklyReport')
            ->firstOrFail();

        if ($week->days()->count() < 5) {
            return response()->json([
                'message' => 'You must complete all Monday to Friday entries before submission.',
            ], 422);
        }

        if (!$week->weeklyReport || empty($week->weeklyReport->work_done)) {
            return response()->json([
                'message' => 'Complete the weekly report before submitting.',
            ], 422);
        }

        if (in_array($week->status, ['submitted', 'approved'])) {
            return response()->json([
                'message' => 'This week has already been submitted.',
            ], 422);
        }

        $week->update([
            'status' => 'submitted',
        ]);

        LogbookDay::where('logbook_week_id', $week->id)->update([
            'locked' => true,
        ]);

        return response()->json([
            'message' => 'Week submitted successfully.',
            'week' => $week->fresh(),
        ]);
    }

    public function history(Request $request)
    {
        $weeks = LogbookWeek::where('user_id', $request->user()->id)
           ->with('days.attachments', 'days.attendanceLog', 'weeklyReport')
            ->latest('week_start_date')
            ->get();

        return response()->json([
            'weeks' => $weeks,
        ]);
    }
}