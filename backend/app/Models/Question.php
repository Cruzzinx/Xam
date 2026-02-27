<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['exam_id','type','file_path','file_type','prompt','options','answer','score'];


    protected $casts = [
        'options' => 'array',
    ];


    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}
