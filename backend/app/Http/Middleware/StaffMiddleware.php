<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (
            !$request->user()
            || !in_array($request->user()->role, ['staff', 'admin'])
            || !$request->user()->is_active
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Staff access only.',
            ], 403);
        }

        return $next($request);
    }
}
