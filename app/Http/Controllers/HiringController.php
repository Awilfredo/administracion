<?php

namespace App\Http\Controllers;


use App\Models\Hiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\MailService;

class HiringController extends Controller
{


    public function sendAccesosNewHiring($anamai, $userAgenda, $userMensajeria, $pwd, $ananam, $anacod)
    {
        $ms365 = new MailService();
        $to = $anamai;
        $bcc = ["awcruz@red.com.sv" => "", "dbolaines@red.com.sv" => ""];
        $subject = "Credenciales de acceso";
        $ananam = strtolower($ananam);
        $nombreCapitalizado = ucwords($ananam);
        $san = '<a href="http://san.red.com.sv">Click para ir a SAN</a>';
        $agenda = '<a href="http://control.datared.com.sv/">Click para ir a Agenda/Mensajeria</a>';

        $body = "
        <div>
            <h1>Saludos, $nombreCapitalizado</h1>
            <p>Se adjuntan las credenciales para los portales empresariales.</p>
            <ul>
                <li><strong>SAN: </strong> $anacod</li>
                <li><strong>Agenda: </strong> $userAgenda</li>
                <li><strong>Mensajeria: </strong> $userMensajeria</li>
                <li><strong>Password para todos los anteriores: </strong> $pwd </li>                
            </ul>            

            <p>Enlaces</p>
            $san
            </br>
            $agenda
        </div>
     ";


        $ms365->sendEmail($to, "", $subject, $body, "", $bcc);
    }

    public function statusOffice365Step(Request $request)
    {
        $idTrx = $request->id;

        $result = DB::connection('san')->select("
            SELECT * FROM aplicaciones.hiring_flow WHERE id_trx=$idTrx
        ");

        $result = DB::connection('san')->select("SELECT * FROM aplicaciones.hiring_flow WHERE id_trx = ?", [$idTrx]);

        // Obtener el primer registro (si existe)
        $firstRecord = $result[0] ?? null;

        if ($firstRecord) {
            $anacod = $firstRecord->anacod;
            $status = $firstRecord->status;
            if (!$status) {
                $anaData = DB::connection('san')->select("SELECT * FROM aplicaciones.datos_empleados WHERE anacod = ?", [$anacod]);
                $firstAnaData = $anaData[0] ?? null;

                if ($firstAnaData) {
                    $infoJson = $firstAnaData->info;
                    $infoObject = json_decode($infoJson);
                    $anamai = $infoObject->anamai;
                    $userAgenda = $infoObject->usuario_red_control;
                    $userMensajeria = $infoObject->usuario_mensajeria;
                    $pwd = $infoObject->anapas;
                    $ananam = $infoObject->ananam;
                    $this->sendAccesosNewHiring($anamai, $userAgenda, $userMensajeria, $pwd, $ananam, $anacod);

                    $result = DB::connection('san')->update(
                        "UPDATE aplicaciones.hiring_flow SET status = ? WHERE id_trx = ?",
                        [true, $idTrx]
                    );
                }

                // echo "Procesando registro";
            } else {
                // echo "Registro ya fue procesado.";
            }
        } else {
            // echo "No se encontró ningún registro con el ID proporcionado.";
        }

        // return response()->json(['message' => 'tu madriscal', 'id' => $idTrx]);
        return Inertia::render('TempPage');
    }


    public function statusSapStep(Request $request)
    {
        $idTrx = $request->id;

        $result = DB::connection('san')->select("
            SELECT * FROM aplicaciones.hiring_flow WHERE id_trx=$idTrx
        ");

        $result = DB::connection('san')->select("SELECT * FROM aplicaciones.hiring_flow WHERE id_trx = ?", [$idTrx]);

        // Obtener el primer registro (si existe)
        $firstRecord = $result[0] ?? null;

        if ($firstRecord) {
            $result = DB::connection('san')->update(
                "UPDATE aplicaciones.hiring_flow SET status = ? WHERE id_trx = ?",
                [true, $idTrx]
            );
        } else {
            // echo "No se encontró ningún registro con el ID proporcionado.";
        }

        // return response()->json(['message' => 'tu madriscal', 'id' => $idTrx]);
        return Inertia::render('TempPage');
    }
}
