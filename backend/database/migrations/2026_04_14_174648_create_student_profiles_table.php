<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('matric_number')->unique();
            $table->string('department');
            $table->string('faculty');
            $table->string('level');
            $table->string('school_email')->unique();
            $table->string('organization_name')->nullable();
            $table->string('organization_address')->nullable();
            $table->string('industry_supervisor_name')->nullable();
            $table->string('industry_supervisor_email')->nullable();
            $table->string('industry_supervisor_phone')->nullable();
            $table->date('training_start_date')->nullable();
            $table->date('training_end_date')->nullable();
            $table->string('passport_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};