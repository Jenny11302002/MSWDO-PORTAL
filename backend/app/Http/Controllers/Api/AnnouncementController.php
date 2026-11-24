<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::where('is_published', true)
            ->orderByDesc('published_at')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ]);
    }

    public function adminIndex()
    {
        return response()->json([
            'success' => true,
            'data' => Announcement::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:10000',
            'is_published' => 'sometimes|boolean',
        ]);

        $published = $validated['is_published'] ?? false;
        $announcement = Announcement::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'is_published' => $published,
            'published_at' => $published ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully.',
            'data' => $announcement,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $announcement = Announcement::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|max:10000',
            'is_published' => 'sometimes|boolean',
        ]);

        if (array_key_exists('is_published', $validated)) {
            $validated['published_at'] = $validated['is_published']
                ? ($announcement->published_at ?? now())
                : null;
        }

        $announcement->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully.',
            'data' => $announcement->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        Announcement::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully.',
        ]);
    }
}
