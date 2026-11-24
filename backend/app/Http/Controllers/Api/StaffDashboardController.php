<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Support\StaffPermissions;
use Illuminate\Http\Request;

class StaffDashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalRequests = ServiceRequest::count();

        $pendingRequests = ServiceRequest::where('status', 'pending')->count();

        $underReviewRequests = ServiceRequest::where('status', 'under_review')->count();

        $approvedRequests = ServiceRequest::where('status', 'approved')->count();

        $rejectedRequests = ServiceRequest::where('status', 'rejected')->count();

        $completedRequests = ServiceRequest::where('status', 'completed')->count();

        $recentRequests = StaffPermissions::allows(
            $request->user()->permissions,
            'requests',
            'view'
        )
            ? ServiceRequest::with('service')->latest()->take(5)->get()
            : [];

        return response()->json([
            'success' => true,
            'data' => [
                'total_requests' => $totalRequests,
                'pending_requests' => $pendingRequests,
                'under_review_requests' => $underReviewRequests,
                'approved_requests' => $approvedRequests,
                'rejected_requests' => $rejectedRequests,
                'completed_requests' => $completedRequests,
                'recent_requests' => $recentRequests,
            ],
        ]);
    }
}
