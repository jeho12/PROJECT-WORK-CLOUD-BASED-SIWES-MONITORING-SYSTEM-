<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentProfile extends Model
{
    use HasFactory;

   protected $fillable = [
    'user_id',
    'supervisor_id',
    'matric_number',
    'department',
    'faculty',
    'level',
    'school_email',
    'organization_name',
    'organization_address',
    'industry_supervisor_name',
    'industry_supervisor_email',
    'industry_supervisor_phone',
    'training_start_date',
    'training_end_date',
    'passport_path',
];

    protected $appends = ['is_complete', 'passport_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supervisor()
{
    return $this->belongsTo(User::class, 'supervisor_id');
}

    public function getIsCompleteAttribute()
    {
        return !empty($this->matric_number)
            && !empty($this->department)
            && !empty($this->faculty)
            && !empty($this->level)
            && !empty($this->school_email);
    }

    public function getPassportUrlAttribute()
    {
        return $this->passport_path
            ? asset('storage/' . $this->passport_path)
            : null;
    }
}