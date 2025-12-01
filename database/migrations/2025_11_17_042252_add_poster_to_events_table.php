<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('events', function (Blueprint $table) {

            // 🔥 Cek dulu apakah kolom belum ada
            if (!Schema::hasColumn('events', 'poster_url')) {
                $table->string('poster_url')->nullable()->after('location');
            }
        });
    }

    public function down()
    {
        Schema::table('events', function (Blueprint $table) {

            // 🔥 Hindari error jika kolom sudah hilang
            if (Schema::hasColumn('events', 'poster_url')) {
                $table->dropColumn('poster_url');
            }
        });
    }
};
