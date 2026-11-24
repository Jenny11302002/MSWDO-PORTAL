<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
    'service_name',
    'description',
    'requirements',
    'eligibility',
    'instructions',
    'is_active',
];

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }
}