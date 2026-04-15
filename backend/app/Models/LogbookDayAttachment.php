<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LogbookDayAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'logbook_day_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected $appends = ['file_url'];

    public function logbookDay()
    {
        return $this->belongsTo(LogbookDay::class);
    }

    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}