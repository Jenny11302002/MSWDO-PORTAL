<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StaffAuthController extends Controller
{
    // Staff Login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        // Get authenticated user FIRST
        $user = Auth::user();

        // Check staff or admin role
        if (!in_array($user->role, ['staff', 'admin']) || !$user->is_active) {
            Auth::logout();

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Staff access only.',
            ], 403);
        }

        // Generate API token
        $token = $user->createToken('staff-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Staff login successful.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    // Staff Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff logout successful.',
        ]);
    }

    // Staff Profile
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }
}
