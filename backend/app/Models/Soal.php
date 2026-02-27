<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    use HasFactory;
    protected $table = 'soal';
    protected $fillable = [
        'mapel_id', 'pertanyaan', 'opsi_a', 'opsi_b',
        'opsi_c', 'opsi_d', 'jawaban_benar'
    ];

    public function mapel()
    {
        return $this->belongsTo(Mapel::class);
    }
}
