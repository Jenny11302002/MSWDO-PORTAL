<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    // Track service request using reference number
    public function track(Request $request)
    {
        $validated = $request->validate([
            'reference_number' => 'required|string|max:255',
        ]);

        $serviceRequest = ServiceRequest::with([
            'service',
            'documents'
        ])
        ->where('reference_number', $validated['reference_number'])
        ->first();

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Service request not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Service request found.',
            'data' => [
                'reference_number' => $serviceRequest->reference_number,
                'applicant_name' => $serviceRequest->applicant_name,
                'service_name' => $serviceRequest->service->service_name,
                'status' => $serviceRequest->status,
                'remarks' => $serviceRequest->remarks,
                'submitted_at' => $serviceRequest->submitted_at,
                'documents' => $serviceRequest->documents,
            ],
        ]);
    }
}