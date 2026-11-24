<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // Display all active services
    public function index()
    {
        $services = Service::where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    public function staffIndex()
    {
        return response()->json([
            'success' => true,
            'data' => Service::latest()->get(),
        ]);
    }

    // Create a new service
    public function store(Request $request)
    {
       $validated = $request->validate([
    'service_name' => 'required|string|max:255',
    'description' => 'nullable|string',
    'requirements' => 'nullable|string',
    'eligibility' => 'nullable|string',
    'instructions' => 'nullable|string',
    'is_active' => 'sometimes|boolean',
]);
        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully.',
            'data' => $service,
        ], 201);
    }

    // Display one service
    public function show(string $id)
    {
        $service = Service::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }

    // Update a service
    public function update(Request $request, string $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
    'service_name' => 'sometimes|required|string|max:255',
    'description' => 'nullable|string',
    'requirements' => 'nullable|string',
    'eligibility' => 'nullable|string',
    'instructions' => 'nullable|string',
    'is_active' => 'sometimes|boolean',
]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully.',
            'data' => $service,
        ]);
    }

    // Delete a service
    public function destroy(string $id)
    {
        $service = Service::findOrFail($id);

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully.',
        ]);
    }
}