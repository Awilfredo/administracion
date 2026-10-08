<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleado_presupuestos', function (Blueprint $table) {
            $table->string('anacod', 50)->primary();
            $table->unsignedBigInteger('presupuestos_user_id')->nullable()->unique();
            $table->enum('sync_status', ['pending', 'ok', 'error'])->default('pending');
            $table->text('last_error')->nullable();
            $table->text('last_password')->nullable();
            $table->json('cc_cuentas')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleado_presupuestos');
    }
};
