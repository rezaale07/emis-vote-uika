<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class StudentsImport
{
    public int $success = 0;
    public int $failed = 0;
    public array $errors = [];

    public function handle(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // skip header

            $excelRow = $index + 1;

            $name  = trim($row[0] ?? '');
            $npm   = trim($row[1] ?? '');
            $email = strtolower(trim($row[2] ?? ''));

            if ($name === '' && $npm === '' && $email === '') continue;

            if ($name === '' || $npm === '' || $email === '') {
                $this->fail($excelRow, 'data wajib kosong');
                continue;
            }

            if (User::where('username', $npm)->exists()) {
                $this->fail($excelRow, 'npm sudah terdaftar');
                continue;
            }

            User::create([
                'name'     => $name,
                'username' => $npm,
                'email'    => $email,
                'password' => Hash::make($npm),
                'role'     => 'student',
            ]);

            $this->success++;
        }
    }

    private function fail(int $row, string $msg)
    {
        $this->failed++;
        $this->errors[] = "Baris {$row}: {$msg}";
    }
}
