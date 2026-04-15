<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->integer('month');
            $table->integer('year');

            $table->text('summary')->nullable();
            $table->text('evaluation')->nullable();
            $table->text('strengths')->nullable();
            $table->text('weaknesses')->nullable();
            $table->text('recommendations')->nullable();
            $table->string('rating')->nullable();

            $table->timestamps();

            $table->unique(['student_id', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_reviews');
    }
};