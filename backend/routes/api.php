<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LogbookAttachmentController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\SupervisorController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/ping', function () {
    return response()->json([
        'message' => 'Backend API is working',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', [DashboardController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Student Profile
    |--------------------------------------------------------------------------
    */
    Route::prefix('student-profile')->group(function () {
        Route::get('/', [StudentProfileController::class, 'show']);
        Route::post('/', [StudentProfileController::class, 'storeOrUpdate']);
    });

    /*
    |--------------------------------------------------------------------------
    | Attendance
    |--------------------------------------------------------------------------
    */
    Route::prefix('attendance')->group(function () {
        Route::get('/status', [AttendanceController::class, 'status']);
        Route::post('/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/check-out', [AttendanceController::class, 'checkOut']);
    });

    /*
    |--------------------------------------------------------------------------
    | Logbook
    |--------------------------------------------------------------------------
    */
    Route::prefix('logbook')->group(function () {
        Route::get('/today', [LogbookController::class, 'today']);
        Route::post('/today', [LogbookController::class, 'storeToday']);
        Route::get('/history', [LogbookController::class, 'history']);

        Route::get('/week/{weekId}', [LogbookController::class, 'weeklyReport']);
        Route::post('/week/{weekId}/report', [LogbookController::class, 'saveWeeklyReport']);
        Route::post('/week/{weekId}/submit', [LogbookController::class, 'submitWeek']);

        Route::post('/day/{logbookDayId}/attachments', [LogbookAttachmentController::class, 'upload']);
        Route::delete('/attachments/{attachmentId}', [LogbookAttachmentController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Supervisor
    |--------------------------------------------------------------------------
    */
    Route::prefix('supervisor')->group(function () {
        Route::get('/dashboard', [SupervisorController::class, 'dashboard']);
        Route::get('/week/{weekId}', [SupervisorController::class, 'submittedWeekDetails']);
        Route::post('/week/{weekId}/review', [SupervisorController::class, 'reviewWeek']);
    });
});