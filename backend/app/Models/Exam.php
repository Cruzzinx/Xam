<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'title',
        'description',
        'duration_minutes',
        'start_at',
        'end_at'
    ];

    // --- TAMBAHKAN INI ---
    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
