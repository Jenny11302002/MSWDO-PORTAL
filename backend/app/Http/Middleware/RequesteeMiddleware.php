<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequesteeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'client' || !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Client access only.',
            ], 403);
        }

        return $next($request);
    }
}
