<?php

namespace App\Http\Controllers;

use App\Models\Mapel;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class MapelController extends Controller
{
    #[OA\Get(
        path: "/api/admin/mapel/{kelas_id}",
        summary: "Daftar semua mata pelajaran per kelas",
        tags: ["Admin - Mapel"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "kelas_id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success", content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object")))
        ]
    )]
    public function index($kelas_id)
    {
        $mapel = Mapel::where('kelas_id', $kelas_id)->get();
        return response()->json($mapel);
    }

    #[OA\Post(
        path: "/api/admin/mapel",
        summary: "Tambah mata pelajaran baru",
        tags: ["Admin - Mapel"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_mapel", "kelas_id"],
                properties: [
                    new OA\Property(property: "nama_mapel", type: "string", example: "Matematika"),
                    new OA\Property(property: "kelas_id", type: "integer", example: 1)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Success"),
            new OA\Response(response: 422, description: "Validation Error")
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'nama_mapel' => 'required|string|max:100',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $mapel = Mapel::create([
            'nama_mapel' => $request->nama_mapel,
            'kelas_id' => $request->kelas_id
        ]);

        return response()->json([
            'message' => 'Mapel berhasil ditambahkan',
            'data' => $mapel
        ]);
    }

    #[OA\Put(
        path: "/api/admin/mapel/{id}",
        summary: "Update mata pelajaran",
        tags: ["Admin - Mapel"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_mapel", "kelas_id"],
                properties: [
                    new OA\Property(property: "nama_mapel", type: "string", example: "Fisika"),
                    new OA\Property(property: "kelas_id", type: "integer", example: 1)
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
        $request->validate([
            'nama_mapel' => 'required|string|max:100',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $mapel = Mapel::findOrFail($id);
        $mapel->update([
            'nama_mapel' => $request->nama_mapel,
            'kelas_id' => $request->kelas_id
        ]);

        return response()->json([
            'message' => 'Mapel berhasil diperbarui',
            'data' => $mapel
        ]);
    }

    #[OA\Delete(
        path: "/api/admin/mapel/{id}",
        summary: "Hapus mata pelajaran",
        tags: ["Admin - Mapel"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function destroy($id)
    {
        $mapel = Mapel::find($id);
        if (!$mapel) {
            return response()->json(['message' => 'Mapel tidak ditemukan'], 404);
        }

        $mapel->delete();

        return response()->json(['message' => 'Mapel berhasil dihapus']);
    }
}
