<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            // relasi ke votings & vote_options tetap pakai foreign key
            $table->foreignId('voting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vote_option_id')->constrained()->cascadeOnDelete();

            // 🔧 user_id sekarang integer biasa, TANPA foreign key
            $table->unsignedBigInteger('user_id');

            $table->timestamps();

            // 1 user hanya bisa punya 1 vote per voting
            $table->unique(['voting_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
