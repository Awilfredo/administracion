<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('empleado_accion_tipos')
            ->select('nombre', DB::raw('COUNT(*) as c'))
            ->groupBy('nombre')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        if ($duplicates->isNotEmpty()) {
            throw new \RuntimeException(
                'No se puede hacer UNIQUE en nombre: hay duplicados. ' .
                'Ejecuta primero la limpieza de duplicados. ' .
                json_encode($duplicates->toArray())
            );
        }

        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->dropUnique(['codigo']);
        });

        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->string('nombre', 100)->unique()->change();
        });

        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->dropColumn('codigo');
        });
    }

    public function down(): void
    {
        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->string('codigo', 50)->nullable()->after('id');
        });

        DB::table('empleado_accion_tipos')->update([
            'codigo' => DB::raw("LOWER(REPLACE(REPLACE(REPLACE(nombre, ' ', '_'), '/', ' .'), 'á', 'a'))"),
        ]);

        Schema::table('empleado_accion_tipos', function (Blueprint $table) {
            $table->string('codigo', 50)->nullable(false)->change();
            $table->unique('codigo');
        });
    }
};