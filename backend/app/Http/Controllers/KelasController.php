<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class KelasController extends Controller
{
    #[OA\Get(
        path: "/api/admin/kelas",
        summary: "Daftar semua kelas",
        tags: ["Admin - Kelas"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(response: 200, description: "Success", content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object")))
        ]
    )]
    public function index()
    {
        return response()->json(Kelas::withCount('users')->get());
    }

    #[OA\Post(
        path: "/api/admin/kelas",
        summary: "Tambah kelas baru",
        tags: ["Admin - Kelas"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_kelas"],
                properties: [
                    new OA\Property(property: "nama_kelas", type: "string", example: "Kelas 10")
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
            'nama_kelas' => 'required|string|max:100',
        ]);

        $kelas = Kelas::create([
            'nama_kelas' => $request->nama_kelas
        ]);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan',
            'data' => $kelas
        ]);
    }

    #[OA\Put(
        path: "/api/admin/kelas/{id}",
        summary: "Update nama kelas",
        tags: ["Admin - Kelas"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["nama_kelas"],
                properties: [
                    new OA\Property(property: "nama_kelas", type: "string", example: "Kelas 10-A")
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
        if ($request->isMethod('put') || $request->isMethod('patch')) {
            $request->merge($request->all());
        }

        $request->validate([
            'nama_kelas' => 'required|string|max:100',
        ]);

        $kelas = Kelas::findOrFail($id);
        $kelas->update([
            'nama_kelas' => $request->nama_kelas
        ]);

        return response()->json([
            'message' => 'Kelas berhasil diperbarui',
            'data' => $kelas
        ]);
    }

    #[OA\Delete(
        path: "/api/admin/kelas/{id}",
        summary: "Hapus kelas",
        tags: ["Admin - Kelas"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success"),
            new OA\Response(response: 404, description: "Not Found")
        ]
    )]
    public function destroy($id)
    {
        try {
            $kelas = Kelas::find($id);
            if (!$kelas) {
                return response()->json(['message' => 'Kelas tidak ditemukan'], 404);
            }
    
            $kelas->delete();
    
            return response()->json(['message' => 'Kelas berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus kelas karena masih ada data terkait',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/admin/kelas/{id}/users",
        summary: "Daftar siswa dalam kelas",
        tags: ["Admin - Kelas"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Success", content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object")))
        ]
    )]
    public function showUsers($id)
    {
        $kelas = Kelas::findOrFail($id);
        $users = $kelas->users()->get(['id', 'name', 'username', 'email']);
        return response()->json($users);
    }
}
