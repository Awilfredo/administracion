<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleado_acciones', function (Blueprint $table) {
            $table->id();
            $table->string('anacod', 50)->index();
            $table->foreignId('tipo_id')->constrained('empleado_accion_tipos')->restrictOnDelete();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->unsignedSmallInteger('dias');
            $table->text('motivo');
            $table->enum('estado', ['aprobado', 'cancelado'])->default('aprobado');
            $table->text('observaciones')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleado_acciones');
    }
};
