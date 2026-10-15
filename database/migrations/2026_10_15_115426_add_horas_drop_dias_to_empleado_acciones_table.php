<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empleado_acciones', function (Blueprint $table) {
            $table->time('hora_inicio')->nullable()->after('fecha_fin');
            $table->time('hora_fin')->nullable()->after('hora_inicio');
            $table->dropColumn('dias');
        });
    }

    public function down(): void
    {
        Schema::table('empleado_acciones', function (Blueprint $table) {
            $table->unsignedSmallInteger('dias')->default(0)->after('fecha_fin');
            $table->dropColumn(['hora_inicio', 'hora_fin']);
        });
    }
};
