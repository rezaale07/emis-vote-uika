<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('votings')) {
            Schema::table('votings', function (Blueprint $table) {
                if (!Schema::hasColumn('votings', 'poster')) {
                    $table->string('poster')->nullable()->after('description');
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('votings')) {
            Schema::table('votings', function (Blueprint $table) {
                if (Schema::hasColumn('votings', 'poster')) {
                    $table->dropColumn('poster');
                }
            });
        }
    }
};
