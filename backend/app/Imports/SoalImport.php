<?php

namespace App\Imports;

use App\Models\Soal;

class SoalImport
{
    protected $mapel_id;

    public function __construct($mapel_id)
    {
        $this->mapel_id = $mapel_id;
    }
    
    public function model(array $row)
    {
        // Temporarily disabled for Laravel 12 compatibility
    }
}
