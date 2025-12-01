<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vote_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voting_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();   // <-- FIX: harus photo, bukan photo_url
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vote_options');
    }
};
