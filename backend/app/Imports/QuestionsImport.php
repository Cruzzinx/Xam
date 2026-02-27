<?php

namespace App\Imports;

use App\Models\Question;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionsImport implements ToModel, WithHeadingRow
{
    protected $examId;

    public function __construct($examId)
    {
        $this->examId = $examId;
    }

    public function model(array $row)
    {
        \Log::info('Importing row:', $row);

        // Helper to get data regardless of key type (numeric, English, or Indonesian)
        $getData = function($keys) use ($row) {
            foreach ((array)$keys as $k) {
                if (isset($row[$k])) {
                    // Strip literal quotes if present (some CSV exporters add them)
                    return trim($row[$k], " \t\n\r\0\x0B\"");
                }
            }
            return null;
        };

        $prompt   = $getData(['prompt', 'soal', 0]);
        $option_a = $getData(['option_a', 'pilihan_a', 1]);
        $option_b = $getData(['option_b', 'pilihan_b', 2]);
        $option_c = $getData(['option_c', 'pilihan_c', 3]);
        $option_d = $getData(['option_d', 'pilihan_d', 4]);
        $answer   = $getData(['answer', 'jawaban_benar', 5]);
        $answer   = $getData(['answer', 'jawaban_benar', 5]);
        // Score is now calculated automatically (100 / total_questions), so we set a default placeholder
        $score    = 0; 

        if (!$prompt) {
            \Log::warning('Skipping row - Prompt empty:', $row);
            return null;
        }

        $options = [$option_a, $option_b, $option_c, $option_d];

        return new Question([
            'exam_id' => $this->examId,
            'prompt'  => $prompt,
            'options' => $options,
            'answer'  => $answer,
            'score'   => $score,
        ]);
    }
}
