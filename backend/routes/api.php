<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LogbookAttachmentController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\SupervisorController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AIReviewController;
use App\Http\Controllers\Api\OnlineSupervisionController;

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
    | Admin
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::post('/supervisors', [AdminController::class, 'createSupervisor']);
        Route::post('/admins', [AdminController::class, 'createAdmin']);
        Route::get('/students', [AdminController::class, 'students']);
        Route::get('/supervisors', [AdminController::class, 'supervisors']);
        Route::post('/assign-supervisor', [AdminController::class, 'assignSupervisor']);
        Route::post('/user/{userId}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::post('/student/{studentId}/reset', [AdminController::class, 'resetStudentProgress']);
    });

     /*
    |--------------------------------------------------------------------------
    | ONLINE SUPERVISION
    |--------------------------------------------------------------------------
    */

    Route::prefix('online-supervision')->group(function () {
    Route::get('/supervisor', [OnlineSupervisionController::class, 'supervisorSessions']);
    Route::get('/student', [OnlineSupervisionController::class, 'studentSessions']);
    Route::post('/schedule', [OnlineSupervisionController::class, 'schedule']);
    Route::post('/join/{id}', [OnlineSupervisionController::class, 'join']);
});






    /*
    |--------------------------------------------------------------------------
    | AI
    |--------------------------------------------------------------------------
    */
    Route::post('/ai-review/{studentId}', [AIReviewController::class, 'generate']);
    Route::get('/ai-review/{studentId}', [AIReviewController::class, 'show']);

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
        Route::get('/student/{studentId}/weeks', [SupervisorController::class, 'studentWeeks']);
        Route::get('/week/{weekId}', [SupervisorController::class, 'submittedWeekDetails']);
        Route::post('/week/{weekId}/review', [SupervisorController::class, 'reviewWeek']);
    });
});