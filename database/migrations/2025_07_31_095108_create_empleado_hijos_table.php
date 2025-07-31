<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('empleado_hijos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('datos_empleados')->onDelete('cascade');
            $table->string('nombre');
            $table->date('fecha_nacimiento');
            $table->string('genero');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleado_hijos');
    }
};
