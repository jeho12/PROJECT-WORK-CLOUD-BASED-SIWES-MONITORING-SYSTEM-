<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\StudentProfile;
use App\Models\LogbookWeek;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    public function studentProfile()
{
    return $this->hasOne(StudentProfile::class);
}

public function logbookWeeks()
{
    return $this->hasMany(LogbookWeek::class);
}

public function attendanceLogs()
{
    return $this->hasMany(AttendanceLog::class);
}

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}