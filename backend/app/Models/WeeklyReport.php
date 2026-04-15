<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WeeklyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'logbook_week_id',
        'projects',
        'section_department',
        'student_comment',
        'work_done',
        'supervisor_comment',
        'supervisor_name',
        'supervisor_rank',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function logbookWeek()
    {
        return $this->belongsTo(LogbookWeek::class);
    }
}