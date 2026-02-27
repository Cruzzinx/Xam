<?php

namespace App\Http\Controllers;

use App\Models\Nilai;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class NilaiController extends Controller
{
    #[OA\Post(
        path: "/api/admin/nilai",
        summary: "Simpan nilai siswa",
        tags: ["Admin - Nilai"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["user_id", "mapel_id", "skor"],
                properties: [
                    new OA\Property(property: "user_id", type: "integer"),
                    new OA\Property(property: "mapel_id", type: "integer"),
                    new OA\Property(property: "skor", type: "integer")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Success")
        ]
    )]
    public function store(Request $request)
    {
        $nilai = Nilai::create([
            'user_id' => $request->user_id,
            'mapel_id' => $request->mapel_id,
            'skor' => $request->skor
        ]);

        return response()->json([
            'message' => 'Nilai berhasil disimpan',
            'data' => $nilai
        ]);
    }

    #[OA\Get(
        path: "/api/admin/nilai/{user_id}",
        summary: "Lihat nilai per siswa",
        tags: ["Admin - Nilai"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "user_id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success", content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object")))
        ]
    )]
    public function show($user_id)
    {
        return response()->json(Nilai::where('user_id', $user_id)->with('mapel')->get());
    }
}
