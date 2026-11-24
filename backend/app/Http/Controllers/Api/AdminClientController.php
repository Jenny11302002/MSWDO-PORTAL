<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminClientController extends Controller
{
    public function index()
    {
        $clients = User::where('role', 'client')
            ->withCount('serviceRequests')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    public function updateStatus(Request $request, string $id)
    {
        $client = User::where('role', 'client')->findOrFail($id);
        $client->update(['is_active' => !$client->is_active]);

        return response()->json([
            'success' => true,
            'message' => $client->is_active
                ? 'Client account activated successfully.'
                : 'Client account deactivated successfully.',
            'data' => $client->fresh(),
        ]);
    }
}
