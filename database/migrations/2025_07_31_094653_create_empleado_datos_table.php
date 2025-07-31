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
        Schema::create('datos_empleados', function (Blueprint $table) {
            $table->id();
            $table->string('cc')->nullable();
            $table->string('anacod');
            $table->string('genero')->nullable();
            $table->string('padre')->nullable();
            $table->string('madre')->nullable();
            $table->string('dui')->nullable();
            $table->string('nit')->nullable();
            $table->string('isss')->nullable();
            $table->string('tipo_afp')->nullable();
            $table->string('afp')->nullable();
            $table->string('tel_casa')->nullable();
            $table->string('cel_personal')->nullable();
            $table->text('direccion')->nullable();
            $table->string('modelo_red_ptt')->nullable();
            $table->string('imei')->nullable();
            $table->string('imei2')->nullable();
            $table->string('simcard')->nullable();
            $table->string('tipo_sim')->nullable();
            $table->text('observacion_equipo')->nullable();
            $table->string('tarjeta_acceso')->nullable();
            $table->string('dui_adjunto')->nullable(); // Aquí solo se guarda la ruta o nombre del archivo
            $table->text('comentarios')->nullable();
            $table->boolean('asegurado')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('datos_empleados');
    }
};
