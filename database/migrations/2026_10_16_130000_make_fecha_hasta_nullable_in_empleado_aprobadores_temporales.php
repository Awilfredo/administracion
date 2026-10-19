<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empleado_aprobadores_temporales', function (Blueprint $table) {
            $table->date('fecha_hasta')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('empleado_aprobadores_temporales', function (Blueprint $table) {
            $table->date('fecha_hasta')->nullable(false)->change();
        });
    }
};
