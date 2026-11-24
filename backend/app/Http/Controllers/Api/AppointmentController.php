<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    // Display all appointments
    public function index()
    {
        $appointments = Appointment::with([
            'serviceRequest.service'
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    // Create a new appointment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_request_id' => 'required|exists:service_requests,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
            'purpose' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $appointment = Appointment::create($validated);

        $appointment->load('serviceRequest.service');

        return response()->json([
            'success' => true,
            'message' => 'Appointment scheduled successfully.',
            'data' => $appointment,
        ], 201);
    }

    // Display a specific appointment
    public function show(string $id)
    {
        $appointment = Appointment::with([
            'serviceRequest.service'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $appointment,
        ]);
    }

    // Update appointment details
    public function update(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'appointment_date' => 'sometimes|required|date|after_or_equal:today',
            'appointment_time' => 'sometimes|required|date_format:H:i',
            'location' => 'sometimes|required|string|max:255',
            'purpose' => 'nullable|string',
            'status' => 'sometimes|required|in:scheduled,completed,cancelled',
            'remarks' => 'nullable|string',
        ]);

        $appointment->update($validated);
        $appointment->load('serviceRequest.service');

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully.',
            'data' => $appointment,
        ]);
    }

    // Delete an appointment
    public function destroy(string $id)
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully.',
        ]);
    }
}
