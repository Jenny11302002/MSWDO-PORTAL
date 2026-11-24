<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'contact_number')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('contact_number', 30)->nullable();
            });
        }

        if (!Schema::hasColumn('users', 'address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('address')->nullable();
            });
        }

        if (!Schema::hasColumn('users', 'is_active')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_active')->default(true);
            });
        }
    }

    public function down(): void
    {
        $columns = array_filter(
            ['contact_number', 'address'],
            fn (string $column) => Schema::hasColumn('users', $column)
        );

        if ($columns) {
            Schema::table('users', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};
