<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    // Appel des seeders pour les données de base
    $this->call([
        UniversitySeeder::class,
        EtablissementSeeder::class,
        ExpertSeeder::class,
    ]);

    
    // Création de l'utilisateur Système d'Information avec son rôle unique
// Cet utilisateur a accès à une interface dédiée non accessible aux autres profils
User::firstOrCreate(
    ['email' => 'si@aneaq.ma'],
    [
        'name' => "Système d'Information",
        'password' => bcrypt('admin'),
        'role' => 'si',
    ]
);
}
}
