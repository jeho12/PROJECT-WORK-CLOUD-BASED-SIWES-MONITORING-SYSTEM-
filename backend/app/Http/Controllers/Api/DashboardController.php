<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\LogbookWeek;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $attendance = AttendanceLog::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $currentWeek = LogbookWeek::where('user_id', $user->id)
            ->whereDate('week_start_date', '<=', $today)
            ->whereDate('week_end_date', '>=', $today)
            ->with(['days', 'weeklyReport'])
            ->first();

        $todayLog = null;
        $completedDayNames = [];

        if ($currentWeek) {
            $todayLog = $currentWeek->days->first(function ($day) use ($today) {
                return optional($day->date)->format('Y-m-d') === $today;
            });

            $completedDayNames = $currentWeek->days
                ->map(function ($day) {
                    return strtolower($day->day_name);
                })
                ->values()
                ->toArray();
        }

        return response()->json([
            'attendance' => [
                'checked_in' => !!$attendance?->check_in_time,
                'checked_out' => !!$attendance?->check_out_time,
                'check_in_time' => $attendance?->check_in_time,
                'check_out_time' => $attendance?->check_out_time,
                'check_in_address' => $attendance?->check_in_address,
                'check_out_address' => $attendance?->check_out_address,
            ],
            'today_log' => [
                'exists' => !!$todayLog,
                'completed' => !empty($todayLog?->activity),
                'time_in' => $todayLog?->time_in,
                'time_out' => $todayLog?->time_out,
            ],
            'week' => [
                'id' => $currentWeek?->id,
                'status' => $currentWeek?->status ?? 'not_started',
                'days_completed' => $currentWeek?->days->count() ?? 0,
                'total_days' => 5,
                'completed_days' => $completedDayNames,
                'report_saved' => !!$currentWeek?->weeklyReport,
            ],
            'profile' => [
                'complete' => optional($user->studentProfile)->is_complete ?? false,
            ],
        ]);
    }
}