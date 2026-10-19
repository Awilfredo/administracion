<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command('acciones:sincronizar-asistencia')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->onOneServer();

Schedule::command('sharepoint:sync-acciones')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->onOneServer()
    ->onSuccess(function () {
        \Illuminate\Support\Facades\Log::info('SharePoint sync: completed successfully');
    })
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('SharePoint sync: failed');
    });
