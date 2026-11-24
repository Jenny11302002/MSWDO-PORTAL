<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestDocument extends Model
{
    protected $fillable = [
        'service_request_id',
        'document_name',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }
}