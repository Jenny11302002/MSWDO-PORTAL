<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\Api\RequestDocumentController;
use App\Http\Controllers\Api\TrackingController;
use App\Http\Controllers\Api\StaffAuthController;
use App\Http\Controllers\Api\StaffDashboardController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\RequesteeAuthController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AdminClientController;
use App\Http\Controllers\Api\AdminStaffUserController;
use App\Http\Controllers\Api\AdminSettingsController;

Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'MSWDO Online Service Portal API is working!',
    ]);
});

// Public services, announcements, and application submission
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/office-profile', [AdminSettingsController::class, 'publicProfile']);
Route::post('/service-requests', [ServiceRequestController::class, 'store']);

// Tracking API Routes
Route::post('/track-request', [TrackingController::class, 'track']);

// Public Applicant Document Upload
Route::post(
    '/public-upload-document',
    [RequestDocumentController::class, 'publicStore']
);

// Staff Login Route (Public)
Route::post('/staff/login', [StaffAuthController::class, 'login']);

// Client Authentication
Route::post('/client/register', [RequesteeAuthController::class, 'register']);
Route::post('/client/login', [RequesteeAuthController::class, 'login']);

// Protected Client Routes
Route::middleware(['auth:sanctum', 'requestee'])->prefix('client')->group(function () {
    Route::post('/logout', [RequesteeAuthController::class, 'logout']);
    Route::get('/profile', [RequesteeAuthController::class, 'profile']);
    Route::put('/profile', [RequesteeAuthController::class, 'updateProfile']);
    Route::get('/service-requests', [RequesteeAuthController::class, 'serviceRequests']);
    Route::post('/service-requests', [ServiceRequestController::class, 'store']);
});

// Protected Staff Routes
Route::middleware(['auth:sanctum', 'staff'])->group(function () {

    Route::post('/staff/logout', [StaffAuthController::class, 'logout']);

    Route::get('/staff/profile', [StaffAuthController::class, 'profile']);

    Route::get('/staff/dashboard', [StaffDashboardController::class, 'index'])
        ->middleware('permission:dashboard,view');
    Route::get('/staff/services', [ServiceController::class, 'staffIndex'])
        ->middleware('permission:services,view');
    Route::post('/services', [ServiceController::class, 'store'])
        ->middleware('permission:services,manage');
    Route::put('/services/{id}', [ServiceController::class, 'update'])
        ->middleware('permission:services,manage');
    Route::delete('/services/{id}', [ServiceController::class, 'destroy'])
        ->middleware('permission:services,manage');

    Route::get('/service-requests', [ServiceRequestController::class, 'index'])
        ->middleware('permission:requests,view');
    Route::get('/service-requests/{id}', [ServiceRequestController::class, 'show'])
        ->middleware('permission:requests,view');
    Route::put('/service-requests/{id}', [ServiceRequestController::class, 'update'])
        ->middleware('permission:requests,manage');
    Route::patch('/service-requests/{id}', [ServiceRequestController::class, 'update'])
        ->middleware('permission:requests,manage');
    Route::delete('/service-requests/{id}', [ServiceRequestController::class, 'destroy'])
        ->middleware('permission:requests,manage');
    Route::patch('/service-requests/{id}/status', [
        ServiceRequestController::class,
        'updateStatus',
    ])->middleware('permission:requests,manage');

    Route::get('/appointments', [AppointmentController::class, 'index'])
        ->middleware('permission:appointments,view');
    Route::get('/appointments/{id}', [AppointmentController::class, 'show'])
        ->middleware('permission:appointments,view');
    Route::post('/appointments', [AppointmentController::class, 'store'])
        ->middleware([
            'permission:appointments,manage',
            'permission:requests,view',
        ]);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update'])
        ->middleware([
            'permission:appointments,manage',
            'permission:requests,view',
        ]);
    Route::patch('/appointments/{id}', [AppointmentController::class, 'update'])
        ->middleware([
            'permission:appointments,manage',
            'permission:requests,view',
        ]);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy'])
        ->middleware([
            'permission:appointments,manage',
            'permission:requests,view',
        ]);

    Route::post('/staff/track-request', [TrackingController::class, 'track'])
        ->middleware('permission:tracking,view');
    Route::get('/staff/documents', [RequestDocumentController::class, 'staffIndex'])
        ->middleware('permission:documents,view');
    Route::get('/service-requests/{serviceRequestId}/documents', [
        RequestDocumentController::class,
        'index',
    ])->middleware('permission:documents,view');
    Route::post('/service-requests/{serviceRequestId}/documents', [
        RequestDocumentController::class,
        'store',
    ])->middleware('permission:documents,manage');
    Route::get('/documents/{documentId}/view', [
        RequestDocumentController::class,
        'view',
    ])->middleware('permission:documents,view');
    Route::get('/documents/{documentId}/download', [
        RequestDocumentController::class,
        'download',
    ])->middleware('permission:documents,view');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/settings', [AdminSettingsController::class, 'show']);
    Route::put('/settings', [AdminSettingsController::class, 'update']);

    Route::get('/clients', [AdminClientController::class, 'index']);
    Route::patch('/clients/{id}/status', [AdminClientController::class, 'updateStatus']);

    Route::get('/staff-users', [AdminStaffUserController::class, 'index']);
    Route::post('/staff-users', [AdminStaffUserController::class, 'store']);
    Route::put('/staff-users/{id}', [AdminStaffUserController::class, 'update']);
    Route::put('/staff-users/{id}/password', [AdminStaffUserController::class, 'updatePassword']);
    Route::patch('/staff-users/{id}/status', [AdminStaffUserController::class, 'toggleStatus']);

    Route::get('/announcements', [AnnouncementController::class, 'adminIndex']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
});