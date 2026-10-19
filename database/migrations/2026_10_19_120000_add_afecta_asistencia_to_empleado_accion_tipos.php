<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->boolean('afecta_asistencia')->default(true)->after('activo');
        });
    }

    public function down(): void
    {
        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->dropColumn('afecta_asistencia');
        });
    }
};