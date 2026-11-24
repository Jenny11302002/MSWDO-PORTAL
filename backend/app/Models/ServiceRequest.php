<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceRequest extends Model
{
    protected $fillable = [
        'reference_number',
        'service_id',
        'user_id',
        'applicant_name',
        'contact_number',
        'email',
        'address',
        'description',
        'status',
        'remarks',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(RequestDocument::class);
    }

    public function appointments(): HasMany
{
    return $this->hasMany(Appointment::class);
}
}