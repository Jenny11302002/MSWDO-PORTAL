<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();

            $table->string('document_name');
            $table->string('original_name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_documents');
    }
};