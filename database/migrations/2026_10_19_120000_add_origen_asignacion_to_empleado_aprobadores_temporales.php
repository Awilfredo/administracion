<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empleado_aprobadores_temporales', function (Blueprint $table) {
            $table->string('origen_asignacion', 50)->nullable()->default('accion_personal')->after('sync_status');
        });
    }

    public function down(): void
    {
        Schema::table('empleado_aprobadores_temporales', function (Blueprint $table) {
            $table->dropColumn('origen_asignacion');
        });
    }
};