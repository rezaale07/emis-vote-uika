<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('events', function (Blueprint $table) {
    $table->id();

    $table->string('title');
    $table->text('description')->nullable();

    $table->date('date');                 // tanggal event
    $table->time('time')->nullable();     // ⏰ JAM EVENT (NEW)

    $table->string('location')->nullable();

    $table->string('poster_url')->nullable();

    $table->enum('status', ['active', 'expired'])->default('active');

    $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

    $table->timestamps();
});

}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
