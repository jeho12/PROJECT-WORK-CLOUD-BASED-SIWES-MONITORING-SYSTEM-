<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\LogbookDay;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function status(Request $request)
    {
        $today = Carbon::today()->toDateString();

        $attendance = AttendanceLog::where('user_id', $request->user()->id)
            ->whereDate('date', $today)
            ->first();

        return response()->json([
            'attendance' => $attendance,
            'checked_in' => !!$attendance?->check_in_time,
            'checked_out' => !!$attendance?->check_out_time,
        ]);
    }

    public function checkIn(Request $request)
    {
        $validated = $request->validate([
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $today = Carbon::today()->toDateString();
        $user = $request->user();

        $attendance = AttendanceLog::firstOrCreate(
            [
                'user_id' => $user->id,
                'date' => $today,
            ],
            [
                'ip_address' => $request->ip(),
                'device_info' => substr((string) $request->userAgent(), 0, 1000),
            ]
        );

        if ($attendance->check_in_time) {
            return response()->json([
                'message' => 'You have already checked in today.',
            ], 422);
        }

        $todayLog = LogbookDay::whereDate('date', $today)
            ->whereHas('logbookWeek', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        $attendance->update([
            'logbook_day_id' => $todayLog?->id,
            'check_in_time' => now()->format('H:i:s'),
            'check_in_latitude' => $validated['latitude'] ?? null,
            'check_in_longitude' => $validated['longitude'] ?? null,
            'ip_address' => $request->ip(),
            'device_info' => substr((string) $request->userAgent(), 0, 1000),
        ]);

        return response()->json([
            'message' => 'Check-in successful.',
            'attendance' => $attendance->fresh(),
        ]);
    }

    public function checkOut(Request $request)
    {
        $validated = $request->validate([
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $today = Carbon::today()->toDateString();
        $attendance = AttendanceLog::where('user_id', $request->user()->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in_time) {
            return response()->json([
                'message' => 'You must check in before checking out.',
            ], 422);
        }

        if ($attendance->check_out_time) {
            return response()->json([
                'message' => 'You have already checked out today.',
            ], 422);
        }

        $attendance->update([
            'check_out_time' => now()->format('H:i:s'),
            'check_out_latitude' => $validated['latitude'] ?? null,
            'check_out_longitude' => $validated['longitude'] ?? null,
            'ip_address' => request()->ip(),
            'device_info' => substr((string) request()->userAgent(), 0, 1000),
        ]);

        return response()->json([
            'message' => 'Check-out successful.',
            'attendance' => $attendance->fresh(),
        ]);
    }
}