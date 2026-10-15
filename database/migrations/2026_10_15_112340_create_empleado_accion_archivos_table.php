<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleado_accion_archivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_accion_id')->constrained('empleado_acciones')->cascadeOnDelete();
            $table->string('path');
            $table->string('nombre_original');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedInteger('tamano')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleado_accion_archivos');
    }
};
