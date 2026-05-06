<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        // Seul le role 'admin' peut acceder aux routes de gestion des utilisateurs
        Gate::define('admin', function ($user) {
            return $user->role === 'admin';
        });
    }
}
