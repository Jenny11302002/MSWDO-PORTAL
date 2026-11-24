<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RequesteeAuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'contact_number' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:2000',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            ...$validated,
            'role' => 'client',
            'is_active' => true,
        ]);

        return $this->authenticatedResponse($user, 'Client registration successful.', 201);
    }

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

        $user = Auth::user();

        if ($user->role !== 'client' || !$user->is_active) {
            Auth::logout();

            return response()->json([
                'success' => false,
                'message' => 'This account cannot access the client portal.',
            ], 403);
        }

        return $this->authenticatedResponse($user, 'Client login successful.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client logout successful.',
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $changingPassword = $request->filled('password');

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'contact_number' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:2000',
            'current_password' => [
                Rule::requiredIf($changingPassword),
                'nullable',
                'string',
            ],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($changingPassword && !Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The current password is incorrect.',
            ], 422);
        }

        $profile = collect($validated)->only([
            'name',
            'email',
            'contact_number',
            'address',
            'password',
        ])->all();

        unset($profile['password']);

        if ($changingPassword) {
            $profile['password'] = $validated['password'];
        }

        $user->update($profile);

        if ($changingPassword) {
            $user->tokens()
                ->where('id', '!=', $request->user()->currentAccessToken()->id)
                ->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Client profile updated successfully.',
            'data' => $user->fresh(),
        ]);
    }

    public function serviceRequests(Request $request)
    {
        $requests = $request->user()
            ->serviceRequests()
            ->with(['service', 'documents', 'appointments'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    private function authenticatedResponse(User $user, string $message, int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'user' => $user,
                'token' => $user->createToken('client-token')->plainTextToken,
            ],
        ], $status);
    }
}
