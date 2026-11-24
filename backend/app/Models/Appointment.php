<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'service_request_id',
        'appointment_date',
        'appointment_time',
        'location',
        'purpose',
        'status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
        ];
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }
}