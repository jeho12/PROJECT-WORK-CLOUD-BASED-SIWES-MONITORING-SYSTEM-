<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\LogbookDay;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

        $checkInAddress = $this->reverseGeocode(
            isset($validated['latitude']) ? (float) $validated['latitude'] : null,
            isset($validated['longitude']) ? (float) $validated['longitude'] : null
        );

        $attendance->update([
            'logbook_day_id' => $todayLog?->id,
            'check_in_time' => now()->format('H:i:s'),
            'check_in_latitude' => $validated['latitude'] ?? null,
            'check_in_longitude' => $validated['longitude'] ?? null,
            'check_in_address' => $checkInAddress,
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

        $checkOutAddress = $this->reverseGeocode(
            isset($validated['latitude']) ? (float) $validated['latitude'] : null,
            isset($validated['longitude']) ? (float) $validated['longitude'] : null
        );

        $attendance->update([
            'check_out_time' => now()->format('H:i:s'),
            'check_out_latitude' => $validated['latitude'] ?? null,
            'check_out_longitude' => $validated['longitude'] ?? null,
            'check_out_address' => $checkOutAddress,
            'ip_address' => $request->ip(),
            'device_info' => substr((string) $request->userAgent(), 0, 1000),
        ]);

        return response()->json([
            'message' => 'Check-out successful.',
            'attendance' => $attendance->fresh(),
        ]);
    }

    private function reverseGeocode(?float $latitude, ?float $longitude): ?string
    {
        if (!$latitude || !$longitude) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'SIWESLogbookApp/1.0 (kingdom@student.aul.edu.ng)',
                'Accept' => 'application/json',
            ])
                ->timeout(20)
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'jsonv2',
                    'lat' => $latitude,
                    'lon' => $longitude,
                ]);

            if (!$response->successful()) {
                Log::error('Geocode failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]);

                return null;
            }

            $data = $response->json();

            if (!empty($data['display_name'])) {
                return $data['display_name'];
            }

            if (!empty($data['address']) && is_array($data['address'])) {
                return implode(', ', array_filter([
                    $data['address']['road'] ?? null,
                    $data['address']['suburb'] ?? null,
                    $data['address']['city'] ?? null,
                    $data['address']['state'] ?? null,
                    $data['address']['country'] ?? null,
                ]));
            }

            Log::warning('Geocode returned no usable address', [
                'response' => $data,
                'latitude' => $latitude,
                'longitude' => $longitude,
            ]);

            return null;
        } catch (\Throwable $e) {
            Log::error('Geocode exception: ' . $e->getMessage(), [
                'latitude' => $latitude,
                'longitude' => $longitude,
            ]);

            return null;
        }
    }
}