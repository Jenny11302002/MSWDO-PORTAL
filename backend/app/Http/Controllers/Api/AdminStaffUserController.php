<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\StaffPermissions;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminStaffUserController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => User::whereIn('role', ['staff', 'admin'])->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:staff,admin',
            'permissions' => 'sometimes|required|array:dashboard,requests,services,documents,tracking,appointments',
            'permissions.*' => 'array:view,manage',
            'permissions.*.view' => 'boolean',
            'permissions.*.manage' => 'boolean',
        ]);

        $validated['permissions'] = $validated['role'] === 'staff'
            ? StaffPermissions::normalize($validated['permissions'] ?? null)
            : null;
        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff account created successfully.',
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $user = User::whereIn('role', ['staff', 'admin'])->findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => 'sometimes|required|in:staff,admin',
            'permissions' => 'sometimes|required|array:dashboard,requests,services,documents,tracking,appointments',
            'permissions.*' => 'array:view,manage',
            'permissions.*.view' => 'boolean',
            'permissions.*.manage' => 'boolean',
        ]);

        if (($validated['role'] ?? $user->role) !== 'admin'
            && $user->id === auth()->id()
            && $user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'You cannot remove your own administrator access.',
            ], 422);
        }

        if (array_key_exists('permissions', $validated)) {
            $validated['permissions'] = StaffPermissions::normalize(
                $validated['permissions']
            );
        } elseif (array_key_exists('role', $validated) && $validated['role'] === 'staff') {
            $validated['permissions'] = StaffPermissions::defaults();
        }

        $accessChanged = (
            isset($validated['role']) && $validated['role'] !== $user->role
        ) || (
            isset($validated['permissions'])
            && $validated['permissions'] !== $user->permissions
        );
        $user->update($validated);
        if ($accessChanged) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $accessChanged
                ? 'Account access updated. The user must sign in again.'
                : 'Staff information updated successfully.',
            'data' => $user->fresh(),
        ]);
    }

    public function updatePassword(Request $request, string $id)
    {
        $user = User::whereIn('role', ['staff', 'admin'])->findOrFail($id);
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user->update(['password' => $validated['password']]);
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff password updated successfully.',
        ]);
    }

    public function toggleStatus(string $id)
    {
        $user = User::whereIn('role', ['staff', 'admin'])->findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active
                ? 'Staff account activated successfully.'
                : 'Staff account deactivated successfully.',
            'data' => $user->fresh(),
        ]);
    }
}
