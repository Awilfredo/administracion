<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'presupuestos' => [
        'base_url' => env('PRESUPUESTOS_API_BASE_URL'),
        'token' => env('PRESUPUESTOS_API_TOKEN'),
        'tenant' => env('PRESUPUESTOS_API_TENANT', 'red'),
        'timeout' => env('PRESUPUESTOS_API_TIMEOUT', 10),
        'catalog_cache_ttl' => env('PRESUPUESTOS_API_CATALOG_CACHE_TTL', 300),
    ],

    'sharepoint' => [
        'base_url' => env('SHAREPOINT_API_BASE_URL'),
        'api_key' => env('SHAREPOINT_API_KEY'),
        'site_url' => env('SHAREPOINT_SITE_URL'),
        'list' => env('SHAREPOINT_LIST', 'Acciones de Personal'),
        'timeout' => env('SHAREPOINT_API_TIMEOUT', 30),
    ],

];
