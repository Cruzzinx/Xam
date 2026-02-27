<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Question;
use App\Imports\QuestionsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ExamController extends Controller
{
    #[OA\Get(
        path: "/api/admin/exams",
        summary: "Daftar semua ujian (Admin)",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Success", content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object")))
        ]
    )]
    public function index()
    {
        return Exam::with('questions')->get();
    }

    #[OA\Post(
        path: "/api/admin/exams",
        summary: "Buat ujian baru",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title", "duration_minutes"],
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string"),
                    new OA\Property(property: "duration_minutes", type: "integer"),
                    new OA\Property(property: "start_at", type: "string", format: "date-time"),
                    new OA\Property(property: "end_at", type: "string", format: "date-time")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Created"),
            new OA\Response(response: 422, description: "Validation Error")
        ]
    )]
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
        ]);

        $exam = Exam::create($data);
        return response()->json($exam, 201);
    }

    #[OA\Get(
        path: "/api/admin/exams/{exam}",
        summary: "Detail ujian (Admin)",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function show(Exam $exam)
    {
        return $exam->load('questions');
    }

    #[OA\Put(
        path: "/api/admin/exams/{exam}",
        summary: "Update ujian",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string"),
                    new OA\Property(property: "duration_minutes", type: "integer"),
                    new OA\Property(property: "start_at", type: "string", format: "date-time"),
                    new OA\Property(property: "end_at", type: "string", format: "date-time")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated"),
            new OA\Response(response: 422, description: "Validation Error")
        ]
    )]
    public function update(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'duration_minutes' => 'sometimes|integer',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
        ]);

        $exam->update($data);
        return response()->json($exam);
    }

    #[OA\Delete(
        path: "/api/admin/exams/{exam}",
        summary: "Hapus ujian",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 204, description: "Deleted")
        ]
    )]
    public function destroy(Exam $exam)
    {
        $exam->delete();
        return response()->json(null, 204);
    }

    #[OA\Post(
        path: "/api/admin/exams/{exam}/questions",
        summary: "Tambah soal ke ujian",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["prompt", "options", "answer"],
                properties: [
                    new OA\Property(property: "prompt", type: "string"),
                    new OA\Property(property: "options", type: "array", items: new OA\Items(type: "string")),
                    new OA\Property(property: "answer", type: "string")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Added")
        ]
    )]
    public function addQuestion(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'prompt' => 'required|string',
            'options' => 'required|array',
            'answer' => 'required|string',
        ]);
        
        $data['score'] = 0;

        $question = $exam->questions()->create($data);
        return response()->json($question, 201);
    }

    #[OA\Put(
        path: "/api/admin/exams/{exam}/questions/{question}",
        summary: "Update soal",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "question", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "prompt", type: "string"),
                    new OA\Property(property: "options", type: "array", items: new OA\Items(type: "string")),
                    new OA\Property(property: "answer", type: "string")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated")
        ]
    )]
    public function updateQuestion(Request $request, Exam $exam, Question $question)
    {
        $data = $request->validate([
            'prompt' => 'sometimes|string',
            'options' => 'sometimes|array',
            'answer' => 'sometimes|string',
        ]);

        $question->update($data);
        return response()->json($question);
    }

    #[OA\Delete(
        path: "/api/admin/exams/{exam}/questions/{question}",
        summary: "Hapus soal",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "question", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 204, description: "Deleted")
        ]
    )]
    public function deleteQuestion(Exam $exam, Question $question)
    {
        $question->delete();
        return response()->json(null, 204);
    }

    #[OA\Post(
        path: "/api/admin/exams/{exam}/import-questions",
        summary: "Import soal dari Excel/CSV",
        tags: ["Admin - Exams"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "exam", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    properties: [new OA\Property(property: "file", type: "string", format: "binary")]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Imported success"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function importQuestions(Request $request, Exam $exam)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            Excel::import(new QuestionsImport($exam->id), $request->file('file'));
            return response()->json(['message' => 'Soal berhasil diimport!']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengimport soal: ' . $e->getMessage()
            ], 500);
        }
    }
}