<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sanctum Stateful Domains (NOT USED FOR BEARER TOKENS)
    |--------------------------------------------------------------------------
    */

    'stateful' => [],

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | Sanctum will use the Token Guard for Bearer tokens (API tokens).
    | This does NOT require cookies, CSRF protection, or stateful domains.
    |
    */

    'guard' => ['api'],

    /*
    |--------------------------------------------------------------------------
    | Expiration
    |--------------------------------------------------------------------------
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | Disable cookie-based auth for APIs (we only use Bearer tokens).
    |
    */

    'middleware' => [
        'authenticate_session' => null,
        'encrypt_cookies' => null,
        'validate_csrf_token' => null,
    ],

];
