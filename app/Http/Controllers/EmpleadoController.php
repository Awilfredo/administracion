<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Horario;
use App\Models\Hiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class EmpleadoController extends Controller
{
    public function index()
    {
        $empleados = Empleado::where('anatip', 'U')->where('anasta', 'A')->get();
        return Inertia::render('Empleados', ['empleados' => $empleados]);
    }

    public function create()
    {
        $anacods = Empleado::pluck('anacod');
        $horarios = Horario::all();
        $jefes = Empleado::jefes();
        $areas = Empleado::areas();
        $posiciones = Empleado::posiciones();
        return Inertia::render('Empleado/Create', ['anacods' => $anacods, 'jefes' => $jefes, 'areas' => $areas, 'posiciones' => $posiciones, 'horarios' => $horarios]);
    }

    public function store(Request $request)
    {

        // dump($request->all());
        /* $request->validate([
             'anacod' => 'required|string|max:255',
             'nombres' => 'required|string|max:255',
             'apellidos' => 'required|string|max:255',
             'anamai' => 'required|string|max:255',
             'anapas' => 'required|string|max:255',
             'fecha_nacimiento' => 'required|string|max:255',
             'anapai' => 'required|string|max:255',
             'fecha_ingreso' => 'required|string|max:255',
             'anapos' => 'required|string|max:255',
             'anarea' => 'required|string|max:255',
             'anatel' => 'required|string|max:255',
             'anajef' => 'required|string|max:255',
             'folcod' => 'required|string|max:255',
             'anaext' => 'required|string|max:255',
             'horario_id' => 'required|string|max:255',
         ]);*/


        // Instanciar el modelo
        // $hiring = new Hiring();
        // $hiring->newHiring($request);

        // Obtener todos los archivos del request
        $files = $request->allFiles();

        // foreach ($files as $key => $fileArray) {
        //     // Si $fileArray es un array de archivos
        //     if (is_array($fileArray)) {
        //         foreach ($fileArray as $file) {
        //             // Asegúrate de que $file es una instancia de UploadedFile
        //             if ($file instanceof \Illuminate\Http\UploadedFile) {

        //                 \Log::info('File properties: ' . print_r($file, true));

        //                 // Obtener el campo 'document' asociado a este archivo
        //                 $document = $request->input("files.{$key}.document");

        //                 \Log::info('Nombre del archivo: ' . $file->getClientOriginalName());
        //                 // \Log::info('Tipo de archivo: ' . $file->getMimeType());
        //                 // \Log::info('Tamaño del archivo: ' . $file->getSize());
        //                 // \Log::info('Documento: ' . $document); // Log el valor de document                        
        //             }
        //         }
        //     }
        // }

        foreach ($files as $key => $fileArray) {
            if (is_array($fileArray)) {
                foreach ($fileArray as $file) {
                    // Asegúrate de que $file es una instancia de UploadedFile
                    if ($file instanceof \Illuminate\Http\UploadedFile) {
                        // Obtener el campo 'document' asociado a este archivo
                        $document = $request->input("files.$key");
    
                        // Construir un array con todas las propiedades del archivo
                        $fileProperties = [
                            'original_name' => $file->getClientOriginalName(),
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                            'document' => $key,
                            'path' => $file->getPathname()
                        ];
    
                        // Registrar las propiedades del archivo en el log
                        \Log::info('File properties: ' . print_r($fileProperties, true));
    
                        // Puedes procesar los archivos aquí según tus necesidades
                    }
                }
            } else {
                if ($fileArray instanceof \Illuminate\Http\UploadedFile) {
                    $document = $request->input("files.$key.document");
    
                    $fileProperties = [
                        'original_name' => $fileArray->getClientOriginalName(),
                        'mime_type' => $fileArray->getMimeType(),
                        'size' => $fileArray->getSize(),
                        'document' => $document,
                        'path' => $fileArray->getPathname()
                    ];
    
                    \Log::info('File properties: ' . print_r($fileProperties, true));
                }
            }
        }

        // Empleado::store($request);
        // return Redirect::route('empleados.index');
        // var_dump(json_encode($request->all()));
        //dd($request->all());
        // \Log::info(json_encode($request->files));
        return json_encode($request->all());
    }
}
