<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\VotingController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\VoteOptionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ========================
// API CHECK
// ========================
Route::get('/ping', fn() => response()->json(['message' => 'API aktif!']));


// ========================
// AUTH
// ========================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/students/register', [AuthController::class, 'registerStudent']);


// ========================
// EVENTS CRUD
// ========================
Route::get('/events', [EventController::class, 'index']);
Route::post('/events', [EventController::class, 'store']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);

// Event participants
Route::get('/events/{id}/participants', [RegistrationController::class, 'participants']);


// ========================
// REGISTRATIONS
// ========================
Route::get('/registrations', [RegistrationController::class, 'index']);
Route::post('/registrations', [RegistrationController::class, 'store']);
Route::get('/registrations/check', [RegistrationController::class, 'check']);


// ========================
// VOTING CRUD
// ========================
Route::get('/votings', [VotingController::class, 'index']);
Route::post('/votings', [VotingController::class, 'store']);       // Create + Upload Image
Route::get('/votings/{id}', [VotingController::class, 'show']);
Route::put('/votings/{id}', [VotingController::class, 'update']);  // Update + Upload Image
Route::delete('/votings/{id}', [VotingController::class, 'destroy']);


// ========================
// VOTE OPTIONS
// ========================
Route::get('/votings/{id}/options', [VoteOptionController::class, 'index']);
Route::post('/votings/{id}/options', [VoteOptionController::class, 'store']);
Route::put('/votings/{id}/options/{optionId}', [VoteOptionController::class, 'update']);
Route::delete('/votings/{id}/options/{optionId}', [VoteOptionController::class, 'destroy']);


// ========================
// SUBMIT VOTE
// ========================
Route::post('/votes', [VoteController::class, 'store']);


// ========================
// STUDENTS CRUD
// ========================
Route::get('/students', [StudentController::class,'index']);
Route::post('/students', [StudentController::class,'store']);
Route::get('/students/{id}', [StudentController::class,'show']);
Route::put('/students/{id}', [StudentController::class,'update']);
Route::delete('/students/{id}', [StudentController::class,'destroy']);


// ========================
// PROFILE + HISTORY
// ========================
Route::get('/users/{id}/history', [RegistrationController::class, 'history']);
Route::post('/students/{id}/update-profile', [StudentController::class, 'updateProfile']);
