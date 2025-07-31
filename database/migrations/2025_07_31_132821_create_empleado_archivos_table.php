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
        Schema::create('empleado_archivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('datos_empleados')->onDelete('cascade');
            $table->string('nombre'); // nombre original del archivo
            $table->string('ruta');   // path relativo en storage
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleado_archivos');
    }
};
