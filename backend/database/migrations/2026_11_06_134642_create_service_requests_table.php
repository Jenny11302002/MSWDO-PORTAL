<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();

            $table->string('reference_number')->unique();

            $table->foreignId('service_id')
                ->constrained('services')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('applicant_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            $table->text('description')->nullable();

            $table->enum('status', [
                'pending',
                'under_review',
                'approved',
                'rejected',
                'completed',
            ])->default('pending');

            $table->text('remarks')->nullable();

            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};