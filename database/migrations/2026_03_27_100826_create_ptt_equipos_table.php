<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ptt_equipos', function (Blueprint $table) {
            $table->id();
            $table->string('anacod', 50); // 50 characters

            $table->string('licencia')->nullable();
            $table->integer('anexo')->nullable();

            $table->string('numero_telefono')->nullable();
            $table->string('modelo_equipo')->nullable();

            $table->string('imei')->nullable();
            $table->string('imei2')->nullable();

            $table->string('sim')->nullable();
            $table->string('sim2')->nullable();

            $table->string('tipo_sim')->nullable();

            $table->text('descripcion_empresa')->nullable();
            $table->text('plan_operador')->nullable();
            $table->text('comentarios')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ptt_equipos');
    }
};