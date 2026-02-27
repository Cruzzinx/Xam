<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    use HasFactory;
    protected $table = 'kelas';
    protected $fillable = ['nama_kelas'];

    public function mapel()
    {
        return $this->hasMany(Mapel::class);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'kelas_id');
    }
}

