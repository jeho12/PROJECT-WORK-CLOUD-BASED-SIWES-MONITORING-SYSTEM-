<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AIReview extends Model
{
    use HasFactory;

    protected $table = 'ai_reviews';

    protected $fillable = [
        'student_id',
        'month',
        'year',
        'summary',
        'evaluation',
        'strengths',
        'weaknesses',
        'recommendations',
        'rating',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}