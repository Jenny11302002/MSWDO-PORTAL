<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use App\Models\RequestDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RequestDocumentController extends Controller
{
    public function staffIndex()
    {
        $documents = RequestDocument::query()
            ->with('serviceRequest:id,applicant_name,reference_number')
            ->latest()
            ->get([
                'id',
                'service_request_id',
                'document_name',
                'original_name',
                'file_size',
                'created_at',
            ]);

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    public function index(string $serviceRequestId)
    {
        ServiceRequest::findOrFail($serviceRequestId);
        $documents = RequestDocument::where(
            'service_request_id',
            $serviceRequestId
        )->get([
            'id',
            'service_request_id',
            'document_name',
            'original_name',
            'file_size',
            'created_at',
        ]);

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    // Upload supporting document
    public function store(Request $request, string $serviceRequestId)
    {
        $validated = $request->validate([
            'document_name' => 'required|string|max:255',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $serviceRequest = ServiceRequest::findOrFail($serviceRequestId);

        $file = $request->file('document');

        $path = $file->store(
            'request-documents/' . $serviceRequest->id,
            'local'
        );

        $document = RequestDocument::create([
            'service_request_id' => $serviceRequest->id,
            'document_name' => $validated['document_name'],
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully.',
            'data' => $document,
        ], 201);
    }

    // Public applicant document upload using reference number
// Public applicant multiple document upload
public function publicStore(Request $request)
{
    $validated = $request->validate([
        'reference_number' => 'required|string',

        'documents' => 'required|array|min:1|max:10',

        'documents.*.document_name' => 'required|string|max:255',

        'documents.*.document' =>
            'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
    ]);

    $serviceRequest = ServiceRequest::where(
        'reference_number',
        $validated['reference_number']
    )->firstOrFail();

    $uploadedDocuments = [];

    foreach ($request->file('documents') as $index => $fileData) {

        $file = $fileData['document'];

        $path = $file->store(
            'request-documents/' . $serviceRequest->id,
            'local'
        );

        $document = RequestDocument::create([
            'service_request_id' => $serviceRequest->id,
            'document_name' => $validated['documents'][$index]['document_name'],
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        $uploadedDocuments[] = $document;
    }

    return response()->json([
        'success' => true,
        'message' => 'All documents uploaded successfully.',
        'data' => $uploadedDocuments,
    ], 201);
}

    // View uploaded document
public function view(string $documentId)
{
    $document = RequestDocument::findOrFail($documentId);

    if (!Storage::disk('local')->exists($document->file_path)) {
        abort(404, 'Document file not found.');
    }

    return Storage::disk('local')->response(
        $document->file_path,
        $document->original_name,
        [
            'Content-Type' => $document->mime_type,
        ],
        'inline'
    );
}

// Download uploaded document
public function download(string $documentId)
{
    $document = RequestDocument::findOrFail($documentId);

    if (!Storage::disk('local')->exists($document->file_path)) {
        abort(404, 'Document file not found.');
    }

    return Storage::disk('local')->download(
        $document->file_path,
        $document->original_name
    );
}
}