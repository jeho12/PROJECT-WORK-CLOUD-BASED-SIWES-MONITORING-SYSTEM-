<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->decimal('organization_latitude', 10, 7)->nullable()->after('organization_address');
            $table->decimal('organization_longitude', 10, 7)->nullable()->after('organization_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['organization_latitude', 'organization_longitude']);
        });
    }
};