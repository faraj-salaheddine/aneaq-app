<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\Universite;
use App\Models\University;
use Inertia\Inertia;

class UniversiteController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/Universites', [
            'universites' => University::all(),
        ]);
    }
}