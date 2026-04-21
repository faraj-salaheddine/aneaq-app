<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\ExpertDocument;
use App\Models\User;
use App\Mail\ExpertAccountCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExpertController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/Experts/Index', [
            'experts' => Expert::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('SI/Experts/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            // Required
            'nom'      => 'required|string|max:255',
            'prenom'   => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email|unique:experts,email',
            'password' => 'required|min:8',

            // Optional personal
            'telephone'  => 'nullable|string|max:20',
            'specialite' => 'nullable|string|max:255',
            'ville'      => 'nullable|string|max:255',
            'cin_number' => 'nullable|string|max:20',

            // Optional contract
            'contract_start'    => 'nullable|date',
            'contract_end'      => 'nullable|date|after:contract_start',
            'contract_renewals' => 'nullable|integer|min:0',

            // Optional car
            'car_horsepower' => 'nullable|integer|min:0|max:9999',

            // File uploads
            'cin_file'         => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'contract_file'    => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'carte_grise_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // 1. Create user account in users table
        $user = User::create([
            'name'     => $request->nom . ' ' . $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'expert',
        ]);

        // 2. Create expert linked to user
        $expert = Expert::create([
            'user_id'           => $user->id,
            'nom'               => $request->nom,
            'prenom'            => $request->prenom,
            'email'             => $request->email,
            'telephone'         => $request->telephone,
            'specialite'        => $request->specialite,
            'ville'             => $request->ville,
            'cin_number'        => $request->cin_number,
            'contract_start'    => $request->contract_start,
            'contract_end'      => $request->contract_end,
            'contract_renewals' => $request->contract_renewals ?? 0,
            'car_horsepower'    => $request->car_horsepower,
        ]);

        // 3. Store documents securely
        foreach ([
            'cin_file'         => 'cin',
            'contract_file'    => 'contract',
            'carte_grise_file' => 'carte_grise',
        ] as $field => $type) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $path = $file->store("experts/{$expert->id}/{$type}", 'private');

                ExpertDocument::create([
                    'expert_id'     => $expert->id,
                    'type'          => $type,
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'file_size'     => $file->getSize(),
                ]);
            }
        }

        // Send welcome email with credentials
        Mail::to($expert->email)->send(new ExpertAccountCreated($expert, $request->password));

        return redirect()->route('si.experts.index');
    }

    public function edit(Expert $expert)
    {
        return Inertia::render('SI/Experts/Edit', [
            'expert'    => $expert,
            'documents' => $expert->documents()->get()->groupBy('type'),
        ]);
    }

    public function update(Request $request, Expert $expert)
    {
        $request->validate([
            // Required
            'nom'    => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email'  => 'required|email|unique:experts,email,' . $expert->id,

            // Optional personal
            'password'   => 'nullable|min:8',
            'telephone'  => 'nullable|string|max:20',
            'specialite' => 'nullable|string|max:255',
            'ville'      => 'nullable|string|max:255',
            'cin_number' => 'nullable|string|max:20',

            // Optional contract
            'contract_start'    => 'nullable|date',
            'contract_end'      => 'nullable|date|after:contract_start',
            'contract_renewals' => 'nullable|integer|min:0',

            // Optional car
            'car_horsepower' => 'nullable|integer|min:0|max:9999',

            // File uploads
            'cin_file'         => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'contract_file'    => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'carte_grise_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Update expert
        $expert->update([
            'nom'               => $request->nom,
            'prenom'            => $request->prenom,
            'email'             => $request->email,
            'telephone'         => $request->telephone,
            'specialite'        => $request->specialite,
            'ville'             => $request->ville,
            'cin_number'        => $request->cin_number,
            'contract_start'    => $request->contract_start,
            'contract_end'      => $request->contract_end,
            'contract_renewals' => $request->contract_renewals,
            'car_horsepower'    => $request->car_horsepower,
        ]);

        // Update linked user account if password changed
        if ($request->filled('password') && $expert->user) {
            $expert->user->update([
                'name'     => $request->nom . ' ' . $request->prenom,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);
        } elseif ($expert->user) {
            $expert->user->update([
                'name'  => $request->nom . ' ' . $request->prenom,
                'email' => $request->email,
            ]);
        }

        // Replace files if new ones uploaded
        foreach ([
            'cin_file'         => 'cin',
            'contract_file'    => 'contract',
            'carte_grise_file' => 'carte_grise',
        ] as $field => $type) {
            if ($request->hasFile($field)) {
                $old = $expert->documentOfType($type);
                if ($old) {
                    Storage::disk('private')->delete($old->file_path);
                    $old->delete();
                }

                $file = $request->file($field);
                $path = $file->store("experts/{$expert->id}/{$type}", 'private');

                ExpertDocument::create([
                    'expert_id'     => $expert->id,
                    'type'          => $type,
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'file_size'     => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('si.experts.index');
    }

    public function destroy(Expert $expert)
    {
        // Delete files from storage
        foreach ($expert->documents as $doc) {
            Storage::disk('private')->delete($doc->file_path);
        }

        // Delete linked user account
        if ($expert->user) {
            $expert->user->delete();
        }

        $expert->delete();
        return redirect()->route('si.experts.index');
    }

    public function downloadDocument(Expert $expert, ExpertDocument $document)
    {
        abort_if($document->expert_id !== $expert->id, 403);
        $path = Storage::disk('private')->path($document->file_path);
        return response()->download($path, $document->original_name);
    }
}