<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceRequestController extends Controller
{
    // Display all service requests
    public function index()
    {
        $requests = ServiceRequest::with('service')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    // Submit a new service request
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'applicant_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $validated['reference_number'] = 'MSWDO-' . strtoupper(Str::random(10));
        $validated['status'] = 'pending';
        $validated['submitted_at'] = now();
        $validated['user_id'] = $request->user()?->id;

        $serviceRequest = ServiceRequest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service request submitted successfully.',
            'data' => $serviceRequest,
        ], 201);
    }

    // Display a specific service request
    public function show(string $id)
    {
        $serviceRequest = ServiceRequest::with('service')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $serviceRequest,
        ]);
    }

    // Update service request information
    public function update(Request $request, string $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $validated = $request->validate([
            'applicant_name' => 'sometimes|required|string|max:255',
            'contact_number' => 'sometimes|required|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $serviceRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service request updated successfully.',
            'data' => $serviceRequest,
        ]);
    }

    // Update service request status
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,under_review,approved,rejected,completed',
            'remarks' => 'nullable|string',
        ]);

        $serviceRequest = ServiceRequest::findOrFail($id);

        $serviceRequest->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Request status updated successfully.',
            'data' => $serviceRequest,
        ]);
    }

    // Delete a service request
    public function destroy(string $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);

        $serviceRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service request deleted successfully.',
        ]);
    }
}
