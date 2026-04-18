<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\OnlineSupervisionSession;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SupervisionScheduled;

class OnlineSupervisionController extends Controller
{
    public function supervisorSessions(Request $request)
    {
        $user = $request->user();

        $sessions = OnlineSupervisionSession::with('student')
            ->where('supervisor_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    public function studentSessions(Request $request)
    {
        $sessions = OnlineSupervisionSession::with('supervisor')
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    public function schedule(Request $request)
    {
        $supervisor = $request->user();

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'title' => ['required'],
            'description' => ['nullable'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer'],
        ]);

        $student = User::findOrFail($validated['student_id']);

        $room = 'onlinesiwes-' . $student->id . '-' . time();

        $session = OnlineSupervisionSession::create([
            'supervisor_id' => $supervisor->id,
            'student_id' => $student->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'scheduled_at' => $validated['scheduled_at'],
            'duration_minutes' => $validated['duration_minutes'],
            'room_name' => $room,
            'join_url' => "https://meet.jit.si/$room",
        ]);

        Mail::to($student->email)->send(new SupervisionScheduled($session));

        return response()->json([
            'message' => 'Session scheduled successfully',
            'session' => $session
        ]);
    }

    public function join(Request $request, $id)
    {
        $session = OnlineSupervisionSession::with('student.studentProfile')->findOrFail($id);

        $validated = $request->validate([
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
        ]);

        $user = $request->user();

        // Supervisor bypass
        if ($user->id === $session->supervisor_id) {
            $session->update([
                'supervisor_joined_at' => now(),
                'status' => 'in_progress',
            ]);

            return response()->json([
                'join_url' => $session->join_url,
                'location_verified' => true,
            ]);
        }

        $profile = $session->student->studentProfile;

        if (!$profile || !$profile->organization_latitude) {
            return response()->json([
                'message' => 'Organization location not set',
            ], 422);
        }

        $distance = $this->distance(
            $validated['latitude'],
            $validated['longitude'],
            $profile->organization_latitude,
            $profile->organization_longitude
        );

        $verified = $distance <= 300;

        $session->update([
            'join_latitude' => $validated['latitude'],
            'join_longitude' => $validated['longitude'],
            'location_verified' => $verified,
            'student_joined_at' => $verified ? now() : null,
        ]);

        if (!$verified) {
            return response()->json([
                'message' => 'Location mismatch',
            ], 422);
        }

        return response()->json([
            'join_url' => $session->join_url,
            'location_verified' => true,
        ]);
    }

    private function distance($lat1, $lon1, $lat2, $lon2)
    {
        $earth = 6371000;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2)**2 +
             cos(deg2rad($lat1)) *
             cos(deg2rad($lat2)) *
             sin($dLon/2)**2;

        return $earth * (2 * atan2(sqrt($a), sqrt(1 - $a)));
    }
}   