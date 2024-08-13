<?php

namespace App\Http\Controllers;


use App\Models\Hiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class HiringController extends Controller
{
    public function statusOffice365Step(Request $request)
    {
        $idTrx = $request->id;
        return response()->json(['message' => 'tu madriscal', 'id' => $idTrx]);
    }
}
