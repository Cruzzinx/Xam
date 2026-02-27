<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Question;
use App\Models\UserExam;
use Illuminate\Http\Request;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

class ExamController extends Controller
{
    #[OA\Get(
        path: "/api/exams",
        summary: "Get all available exams",
        description: "Returns a list of all exams available for the student",
        tags: ["Exams"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful operation",
                content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object"))
            ),
            new OA\Response(response: 401, description: "Unauthenticated")
        ]
    )]
    public function index()
    {
        $exams = Exam::all()->map(function($exam) {
            return [
                'id' => $exam->id,
                'title' => $exam->title,
                'description' => $exam->description,
                'duration_minutes' => $exam->duration_minutes,
                'start_at' => $exam->start_at,
                'end_at' => $exam->end_at,
                'question_count' => $exam->questions()->count(),
            ];
        });

        return response()->json($exams);
    }

    #[OA\Get(
        path: "/api/exams/{id}",
        summary: "Get exam detail",
        description: "Returns exam information and questions",
        tags: ["Exams"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID of exam to return", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful operation",
                content: new OA\JsonContent(type: "object")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Exam not found")
        ]
    )]
    public function show(Exam $exam)
    {
        $questions = $exam->questions()->inRandomOrder()->get()->map(function($q){
            $options = $q->options;
            
            // Handle cases where options is null or not an array
            if (is_array($options)) {
                shuffle($options);
            } else {
                $options = [];
            }

            return [
                'id' => $q->id,
                'type' => $q->type,
                'file_path' => $q->file_path,
                'file_type' => $q->file_type,
                'prompt' => $q->prompt,
                'options' => $options,
                'score' => $q->score,
            ];
        });

        return response()->json([
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'description' => $exam->description,
                'duration_minutes' => $exam->duration_minutes,
            ],
            'questions' => $questions,
        ]);
    }

    #[OA\Post(
        path: "/api/exams/{id}/start",
        summary: "Start an exam",
        description: "Creates a UserExam record to track the attempt",
        tags: ["Exams"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID of exam to start", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Ujian dimulai",
                content: new OA\JsonContent(type: "object")
            ),
            new OA\Response(response: 400, description: "Exam already in progress"),
            new OA\Response(response: 401, description: "Unauthenticated")
        ]
    )]
    public function start(Request $request, Exam $exam)
    {
        try {
            $user = $request->user();
            \Illuminate\Support\Facades\Log::info("User {$user->id} attempting to start exam {$exam->id}");
    
            // Check if user already has an in-progress exam
            $existingExam = UserExam::where('user_id', $user->id)
                ->where('exam_id', $exam->id)
                ->where('status', 'in_progress')
                ->first();
    
            if ($existingExam) {
                \Illuminate\Support\Facades\Log::info("User {$user->id} already has in-progress exam {$exam->id}. Resuming.");
                return response()->json([
                    'message' => 'Melanjutkan ujian yang sedang berlangsung',
                    'user_exam' => $existingExam
                ]);
            }
    
            // Create new exam attempt
            $userExam = UserExam::create([
                'user_id' => $user->id,
                'exam_id' => $exam->id,
                'started_at' => Carbon::now(),
                'status' => 'in_progress',
            ]);
    
            \Illuminate\Support\Facades\Log::info("User {$user->id} successfully started exam {$exam->id}. Record ID: {$userExam->id}");
    
            return response()->json([
                'message' => 'Ujian dimulai',
                'user_exam' => $userExam
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error starting exam for User {$user->id}, Exam {$exam->id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memulai ujian secara internal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Post(
        path: "/api/exams/{id}/submit",
        summary: "Submit exam answers",
        description: "Finish exam and calculate score",
        tags: ["Exams"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID of exam to submit", schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "answers",
                        type: "array",
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: "question_id", type: "integer", example: 1),
                                new OA\Property(property: "answer", type: "string", example: "4")
                            ]
                        )
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Ujian berhasil dikumpulkan",
                content: new OA\JsonContent(type: "object")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function submit(Request $request, Exam $exam)
    {
        $user = $request->user();

        $payload = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer' => 'nullable|string',
        ]);

        // Calculate score automatically: (Correct / Total) * 100
        $questions = $exam->questions; // Load all questions to avoid N+1 and get total count
        $totalQuestions = $questions->count();
        $correctCount = 0;

        foreach ($payload['answers'] as $ans) {
            $q = $questions->find($ans['question_id']);
            if (!$q) continue;
            
            if (!isset($ans['answer'])) continue;

            if ($q->type === 'multiple') {
                $userAnsArray = array_map('trim', explode(',', (string) $ans['answer']));
                $correctAnsArray = array_map('trim', explode(',', (string) $q->answer));
                
                sort($userAnsArray);
                sort($correctAnsArray);
                
                if ($userAnsArray === $correctAnsArray) {
                    $correctCount++;
                }
            } else {
                // Compare as strings to avoid type mismatches for single choice
                if ((string) $q->answer === (string) $ans['answer']) {
                    $correctCount++;
                }
            }
        }

        // Calculate final score (0-100 scale)
        // If total questions is 0, score is 0 to avoid division by zero
        $score = $totalQuestions > 0 ? round(($correctCount / $totalQuestions) * 100, 2) : 0;

        // Save or update UserExam
        $userExam = UserExam::updateOrCreate(
            [
                'user_id' => $user->id,
                'exam_id' => $exam->id,
                'status' => 'in_progress'
            ],
            [
                'score' => $score,
                'answers' => $payload['answers'],
                'submitted_at' => Carbon::now(),
                'status' => 'completed',
            ]
        );

        return response()->json([
            'message' => 'Ujian berhasil dikumpulkan',
            'score' => $score,
            'user_exam' => $userExam
        ]);
    }

    #[OA\Get(
        path: "/api/exams/results/history",
        summary: "Get user's exam results/history",
        description: "Returns all completed exam attempts for the student",
        tags: ["Exams"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful operation",
                content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object"))
            ),
            new OA\Response(response: 401, description: "Unauthenticated")
        ]
    )]
    public function results(Request $request)
    {
        $user = $request->user();

        $results = UserExam::where('user_id', $user->id)
            ->with('exam:id,title,description')
            ->where('status', 'completed')
            ->orderBy('submitted_at', 'desc')
            ->get();

        return response()->json($results);
    }

    #[OA\Get(
        path: "/api/exams/results/{id}",
        summary: "Get specific exam result detail",
        description: "Returns detail of a specific exam attempt",
        tags: ["Exams"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, description: "ID of user exam record", schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful operation",
                content: new OA\JsonContent(type: "object")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Result not found")
        ]
    )]
    public function resultDetail(Request $request, $userExamId)
    {
        $user = $request->user();

        $userExam = UserExam::where('id', $userExamId)
            ->where('user_id', $user->id)
            ->with('exam.questions')
            ->firstOrFail();

        return response()->json($userExam);
    }
}
