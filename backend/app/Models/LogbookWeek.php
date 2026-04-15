<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LogbookWeek extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'week_start_date',
        'week_end_date',
        'status',
    ];

    protected $appends = ['days_completed', 'is_complete'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function days()
    {
        return $this->hasMany(LogbookDay::class);
    }

    public function weeklyReport()
    {
        return $this->hasOne(WeeklyReport::class);
    }

    public function getDaysCompletedAttribute()
    {
        return $this->days()->count();
    }

    public function getIsCompleteAttribute()
    {
        return $this->days()->count() >= 6;
    }
}