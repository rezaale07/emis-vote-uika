<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ADMIN
        User::create([
            'name' => 'Admin UIKA',
            'username' => 'admin',
            'email' => 'admin@uika.ac.id',
            'role' => 'admin',
            'password' => Hash::make('admin123'),
        ]);

        // STUDENT
        User::create([
            'name' => 'Mahasiswa Demo',
            'username' => '20250001', // NPM di sini
            'email' => '20250001@student.uika.ac.id',
            'role' => 'student',
            'password' => Hash::make('demo123'),
        ]);
    }
}
