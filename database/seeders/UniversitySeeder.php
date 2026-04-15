<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $universities = [
        ['name' => 'Université Al Quaraouiyine – Fès', 'website' => 'http://www.uaq.ma'],
        ['name' => 'Université Mohammed V – Rabat', 'website' => 'http://www.um5.ac.ma/um5/'],
        ['name' => 'Université Hassan II – Casablanca', 'website' => 'http://www.uh2c.ac.ma/'],
        ['name' => 'Université Sidi Mohammed Ben Abdellah – Fès', 'website' => 'http://www.usmba.ac.ma/'],
        ['name' => 'Université Cadi Ayyad – Marrakech', 'website' => 'http://www.uca.ma'],
        ['name' => 'Université Moulay Ismail – Meknès', 'website' => 'http://www.umi.ac.ma'],
        ['name' => 'Université Hassan Premier – Settat', 'website' => 'http://www.uh1.ac.ma/'],
        ['name' => 'Université Abdelmalek Essaadi – Tétouan', 'website' => 'http://www.uae.ma/'],
        ['name' => 'Université Ibn Zohr – Agadir', 'website' => 'http://www.uiz.ac.ma'],
        ['name' => 'Université Chouaïb Doukkali- El Jadida', 'website' => 'http://www.ucd.ac.ma'],
        ['name' => 'Université Mohammed Premier – Oujda', 'website' => 'http://www.ump.ma/'],
        ['name' => 'Université Ibn Tofail – Kénitra', 'website' => 'http://www.univ-ibntofail.ac.ma'],
        ['name' => 'Université Sultan Moulay Slimane – Béni Mellal', 'website' => 'http://www.usms.ac.ma/'],
        ['name' => 'Université Al Akhawayn – Ifrane', 'website' => 'http://www.aui.ma/en/'],
    ];

    foreach ($universities as $university) {
        \App\Models\University::create($university);
    }
}
}
