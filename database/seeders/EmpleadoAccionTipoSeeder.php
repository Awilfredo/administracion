<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmpleadoAccionTipoSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $rows = [
            ['codigo' => 'vacaciones', 'nombre' => 'Vacaciones', 'descripcion' => 'Período de vacaciones remuneradas.', 'requiere_adjunto' => false, 'activo' => true],
            ['codigo' => 'permiso', 'nombre' => 'Permiso', 'descripcion' => 'Permiso personal con o sin goce de sueldo.', 'requiere_adjunto' => false, 'activo' => true],
            ['codigo' => 'incapacidad', 'nombre' => 'Incapacidad', 'descripcion' => 'Incapacidad médica.', 'requiere_adjunto' => false, 'activo' => true],
            ['codigo' => 'otro', 'nombre' => 'Otro', 'descripcion' => 'Otra acción de personal.', 'requiere_adjunto' => false, 'activo' => true],
        ];
        foreach ($rows as &$r) {
            $r['created_at'] = $now;
            $r['updated_at'] = $now;
        }
        DB::table('empleado_accion_tipos')->upsert($rows, ['codigo'], ['nombre', 'descripcion', 'requiere_adjunto', 'activo', 'updated_at']);
    }
}
