<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LogbookAttachmentController;

Route::get('/ping', function () {
    return response()->json([
        'message' => 'Backend API is working'
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/logbook/today', [LogbookController::class, 'today']);
Route::post('/logbook/today', [LogbookController::class, 'storeToday']);
Route::get('/logbook/history', [LogbookController::class, 'history']);
Route::get('/logbook/week/{weekId}', [LogbookController::class, 'weeklyReport']);
Route::post('/logbook/week/{weekId}/report', [LogbookController::class, 'saveWeeklyReport']);
Route::post('/logbook/week/{weekId}/submit', [LogbookController::class, 'submitWeek']);

Route::get('/attendance/status', [AttendanceController::class, 'status']);
Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);

Route::post('/logbook/day/{logbookDayId}/attachments', [LogbookAttachmentController::class, 'upload']);
Route::delete('/logbook/attachments/{attachmentId}', [LogbookAttachmentController::class, 'destroy']);

    Route::get('/student-profile', [StudentProfileController::class, 'show']);
    Route::post('/student-profile', [StudentProfileController::class, 'storeOrUpdate']);
});