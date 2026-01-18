<?php
use App\Http\Controllers\EventController;
use App\Http\Controllers\VoteOptionController;
use App\Http\Controllers\VotingController;
use App\Http\Controllers\VoteResultController;

// Home → redirect ke event
Route::get('/', function () {
    return redirect()->route('events.index');
});

// Event CRUD
Route::resource('events', EventController::class);

// Opsi voting untuk event
Route::prefix('events/{event}')->group(function () {
    Route::resource('vote-options', VoteOptionController::class);
    Route::get('vote', [VotingController::class, 'create'])->name('vote.create');
    Route::post('vote', [VotingController::class, 'store'])->name('vote.store');
    Route::get('vote-results', [VoteResultController::class, 'index'])->name('vote-results.index');
});
