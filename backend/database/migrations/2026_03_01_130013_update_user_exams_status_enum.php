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
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE user_exams MODIFY COLUMN status ENUM('in_progress', 'completed', 'abandoned', 'sudah_remed') DEFAULT 'in_progress'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE user_exams MODIFY COLUMN status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress'");
    }
};
