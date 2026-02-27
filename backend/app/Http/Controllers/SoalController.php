<?php

namespace App\Http\Controllers;

use App\Models\Soal;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class SoalController extends Controller
{
    #[OA\Get(
        path: "/api/admin/soal/{mapel_id}",
        summary: "Daftar semua soal per mata pelajaran",
        tags: ["Admin - Soal"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "mapel_id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success", content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object")))
        ]
    )]
    public function index($mapel_id)
    {
        return response()->json(
            Soal::where('mapel_id', $mapel_id)->get()
        );
    }

    #[OA\Post(
        path: "/api/admin/soal/import",
        summary: "Import soal dari Excel (Soon)",
        tags: ["Admin - Soal"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 501, description: "Not Implemented")
        ]
    )]
    public function import(Request $request)
    {
        return response()->json(['message' => 'Fitur import Excel sedang dalam penyesuaian untuk Laravel 12'], 501);
    }

    #[OA\Put(
        path: "/api/admin/soal/{id}",
        summary: "Update soal",
        tags: ["Admin - Soal"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "pertanyaan", type: "string"),
                    new OA\Property(property: "opsi_a", type: "string"),
                    new OA\Property(property: "opsi_b", type: "string"),
                    new OA\Property(property: "opsi_c", type: "string"),
                    new OA\Property(property: "opsi_d", type: "string"),
                    new OA\Property(property: "jawaban_benar", type: "string", enum: ["A", "B", "C", "D"])
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Success"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function update(Request $request, $id)
    {
        $soal = Soal::findOrFail($id);

        $validated = $request->validate([
            'pertanyaan' => 'sometimes|string',
            'opsi_a' => 'sometimes|string',
            'opsi_b' => 'sometimes|string',
            'opsi_c' => 'sometimes|string',
            'opsi_d' => 'sometimes|string',
            'jawaban_benar' => 'sometimes|in:A,B,C,D',
        ]);

        $soal->update($validated);

        return response()->json([
            'message' => 'Soal berhasil diupdate',
            'data' => $soal
        ]);
    }

    #[OA\Delete(
        path: "/api/admin/soal/{id}",
        summary: "Hapus soal",
        tags: ["Admin - Soal"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function destroy($id)
    {
        $soal = Soal::findOrFail($id);
        $soal->delete();

        return response()->json([
            'message' => 'Soal berhasil dihapus'
        ]);
    }
}
