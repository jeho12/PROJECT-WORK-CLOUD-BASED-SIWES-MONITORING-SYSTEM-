<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIReview;
use App\Models\User;
use App\Services\AIReviewService;
use Illuminate\Support\Facades\DB;

class AIReviewController extends Controller
{
    public function generate($studentId)
    {
        $student = User::findOrFail($studentId);

        $month = now()->month;
        $year = now()->year;

        $logs = DB::table('logbook_days')
            ->join('logbook_weeks', 'logbook_weeks.id', '=', 'logbook_days.logbook_week_id')
            ->where('logbook_weeks.user_id', $studentId)
            ->whereMonth('logbook_days.date', $month)
            ->whereYear('logbook_days.date', $year)
            ->select(
                'logbook_days.date',
                'logbook_days.day_name',
                'logbook_days.time_in',
                'logbook_days.time_out',
                'logbook_days.activity'
            )
            ->get();

        $attendance = DB::table('attendance_logs')
            ->where('user_id', $studentId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->select(
                'date',
                'check_in_time',
                'check_out_time',
                'check_in_address',
                'check_out_address'
            )
            ->get();

        $aiService = new AIReviewService();
        $result = $aiService->generateMonthlyReview($student, $logs, $attendance);

        $review = AIReview::updateOrCreate(
            [
                'student_id' => $studentId,
                'month' => $month,
                'year' => $year,
            ],
            [
                'summary' => $result,
            ]
        );

        return response()->json([
            'review' => $review,
        ]);
    }

    public function show($studentId)
    {
        $review = AIReview::where('student_id', $studentId)
            ->where('month', now()->month)
            ->where('year', now()->year)
            ->first();

        return response()->json($review);
    }
}