<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LogbookDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'logbook_week_id',
        'date',
        'day_name',
        'time_in',
        'time_out',
        'activity',
        'locked',
    ];

    protected $casts = [
        'date' => 'date',
        'locked' => 'boolean',
    ];

    public function logbookWeek()
    {
        return $this->belongsTo(LogbookWeek::class);
    }

    public function attachments()
    {
        return $this->hasMany(LogbookDayAttachment::class);
    }

    public function attendanceLog()
    {
        return $this->hasOne(AttendanceLog::class);
    }
}