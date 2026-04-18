<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OnlineSupervisionSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'supervisor_id',
        'student_id',
        'title',
        'description',
        'scheduled_at',
        'duration_minutes',
        'provider',
        'room_name',
        'join_url',
        'status',
        'join_latitude',
        'join_longitude',
        'join_address',
        'location_verified',
        'verification_reason',
        'student_joined_at',
        'supervisor_joined_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'student_joined_at' => 'datetime',
            'supervisor_joined_at' => 'datetime',
            'location_verified' => 'boolean',
        ];
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}