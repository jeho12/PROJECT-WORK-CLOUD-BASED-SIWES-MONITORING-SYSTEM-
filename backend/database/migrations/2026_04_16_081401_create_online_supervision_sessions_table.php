<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('online_supervision_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervisor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(30);

            $table->string('provider')->default('jitsi');
            $table->string('room_name');
            $table->string('join_url')->nullable();

            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled

            $table->decimal('join_latitude', 10, 7)->nullable();
            $table->decimal('join_longitude', 10, 7)->nullable();
            $table->string('join_address')->nullable();
            $table->boolean('location_verified')->default(false);
            $table->text('verification_reason')->nullable();

            $table->timestamp('student_joined_at')->nullable();
            $table->timestamp('supervisor_joined_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_supervision_sessions');
    }
};