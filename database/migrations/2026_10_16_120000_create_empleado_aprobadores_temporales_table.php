<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleado_aprobadores_temporales', function (Blueprint $table) {
            $table->id();
            $table->string('anacod_origen', 50)->index();
            $table->unsignedInteger('temp_user_id');
            $table->string('temp_user_email', 255)->nullable();
            $table->unsignedBigInteger('accion_personal_id')->nullable()->index();
            $table->date('fecha_desde');
            $table->date('fecha_hasta');
            $table->boolean('pausar_original')->default(false);
            $table->json('cc_cuentas');
            $table->enum('sync_status', ['pending', 'ok', 'error', 'skipped'])->default('pending');
            $table->text('last_error')->nullable();
            $table->json('api_response')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleado_aprobadores_temporales');
    }
};
