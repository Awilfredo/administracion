<?php

namespace Database\Seeders;

use App\Models\EmpleadoAccionTipo;
use Illuminate\Database\Seeder;

class EmpleadoAccionTipoSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Vacaciones', 'descripcion' => 'Período de vacaciones remuneradas.', 'requiere_adjunto' => false, 'activo' => true],
            ['nombre' => 'Permiso', 'descripcion' => 'Permiso personal con o sin goce de sueldo.', 'requiere_adjunto' => false, 'activo' => true],
            ['nombre' => 'Incapacidad', 'descripcion' => 'Incapacidad médica.', 'requiere_adjunto' => false, 'activo' => true],
            ['nombre' => 'Otro', 'descripcion' => 'Otra acción de personal.', 'requiere_adjunto' => false, 'activo' => true],
        ];

        foreach ($tipos as $t) {
            EmpleadoAccionTipo::firstOrCreate(['nombre' => $t['nombre']], $t);
        }
    }
}