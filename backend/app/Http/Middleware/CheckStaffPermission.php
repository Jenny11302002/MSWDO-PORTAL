<?php

namespace App\Http\Middleware;

use App\Support\StaffPermissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckStaffPermission
{
    public function handle(
        Request $request,
        Closure $next,
        string $module,
        string $ability = 'view'
    ): Response {
        $user = $request->user();

        if ($user?->role === 'admin') {
            return $next($request);
        }

        if (!StaffPermissions::allows($user?->permissions, $module, $ability)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this module.',
            ], 403);
        }

        return $next($request);
    }
}
