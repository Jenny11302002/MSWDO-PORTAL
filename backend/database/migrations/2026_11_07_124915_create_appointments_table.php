<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('service_request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();

            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('location');
            $table->text('purpose')->nullable();

            $table->enum('status', [
                'scheduled',
                'completed',
                'cancelled'
            ])->default('scheduled');

            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};