<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentProfileController;

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
    
    Route::get('/student-profile', [StudentProfileController::class, 'show']);
    Route::post('/student-profile', [StudentProfileController::class, 'storeOrUpdate']);
});