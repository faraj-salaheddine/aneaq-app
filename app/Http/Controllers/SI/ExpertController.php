<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\ExpertDocument;
use App\Models\User;
use App\Mail\ExpertAccountCreated;
use App\Mail\ExpertAccountUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Exports\ExpertsExport;
use App\Models\ActivityLog;

class ExpertController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/Experts/Index', [
            'experts' => Expert::all(),
        ]);
    }

    public function export()
    {
        return (new ExpertsExport())->download();
    }

    public function create()
    {
        return Inertia::render('SI/Experts/Create');
    }

    public function store(Request $request)
{
    $request->validate([
        'nom'               => 'required|string|max:255',
        'prenom'            => 'required|string|max:255',
        'email'             => 'required|email|unique:users,email|unique:experts,email',
        'password'          => 'required|min:8',
        'telephone'         => 'nullable|string|max:20',
        'specialite'        => 'nullable|string|max:255',
        'ville'             => 'nullable|string|max:255',
        'cin_number'        => 'nullable|string|max:20',
        'rib'               => 'nullable|string|size:24',
        'rib_file'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'contract_start'    => 'nullable|date',
        'contract_end'      => 'nullable|date|after:contract_start',
        'contract_renewals' => 'nullable|integer|min:0',
        'car_horsepower'    => 'nullable|integer|min:0|max:9999',
        'cin_file'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'contract_file'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'carte_grise_file'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
    ]);

    $user = User::create([
        'name'     => $request->nom . ' ' . $request->prenom,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
        'role'     => 'expert',
    ]);

    $expert = Expert::create([
        'user_id'           => $user->id,
        'nom'               => $request->nom,
        'prenom'            => $request->prenom,
        'email'             => $request->email,
        'telephone'         => $request->telephone,
        'specialite'        => $request->specialite,
        'ville'             => $request->ville,
        'cin_number'        => $request->cin_number,
        'rib'               => $request->rib,
        'contract_start'    => $request->contract_start,
        'contract_end'      => $request->contract_end,
        'contract_renewals' => $request->contract_renewals ?? 0,
        'car_horsepower'    => $request->car_horsepower,
    ]);

    $uploadDate = now()->format('d-m-Y');
    $expertName = str_replace(' ', '_', $expert->nom . '_' . $expert->prenom);

    foreach ([
        'cin_file'         => ['type' => 'cin',        'prefix' => 'CIN'],
        'rib_file'         => ['type' => 'rib',        'prefix' => 'RIB'],
        'contract_file'    => ['type' => 'contract',   'prefix' => 'Contrat'],
        'carte_grise_file' => ['type' => 'carte_grise','prefix' => 'CarteGrise'],
    ] as $field => $meta) {
        if ($request->hasFile($field)) {
            $file      = $request->file($field);
            $extension = $file->getClientOriginalExtension();
            $newName   = $meta['prefix'] . '_' . $expertName . '_' . $uploadDate . '.' . $extension;
            $path      = $file->storeAs("experts/{$expert->id}/{$meta['type']}", $newName, 'private');

            ExpertDocument::create([
                'expert_id'     => $expert->id,
                'type'          => $meta['type'],
                'file_path'     => $path,
                'original_name' => $newName,
                'mime_type'     => $file->getMimeType(),
                'file_size'     => $file->getSize(),
            ]);
        }
    }

    Mail::to($expert->email)->send(new ExpertAccountCreated($expert, $request->password));


    return redirect()->route('si.experts.index');
}

    public function show(Expert $expert)
    {
        return Inertia::render('SI/Experts/Show', [
            'expert'    => $expert,
            'documents' => $expert->documents()->get()->groupBy('type'),
        ]);
    }

    public function previewDocument(Expert $expert, ExpertDocument $document)
    {
        abort_if($document->expert_id !== $expert->id, 403);
        $path = Storage::disk('private')->path($document->file_path);
        return response()->file($path, [
            'Content-Type' => $document->mime_type,
        ]);
    }

    public function edit(Expert $expert)
{
    return Inertia::render('SI/Experts/Edit', [
        'expert'    => $expert,
        'documents' => $expert->documents()->get()->groupBy('type'),
    ]);
}
    public function deleteDocument(Expert $expert, ExpertDocument $document)
{
    abort_if($document->expert_id !== $expert->id, 403);
    Storage::disk('private')->delete($document->file_path);
    $document->delete();
    return back()->with('success', 'Document supprimé avec succès.');
}

    public function update(Request $request, Expert $expert)
{
    $request->validate([
        'nom'               => 'required|string|max:255',
        'prenom'            => 'required|string|max:255',
        'email'             => 'required|email|unique:experts,email,' . $expert->id,
        'password'          => 'nullable|min:8',
        'telephone'         => 'nullable|string|max:20',
        'specialite'        => 'nullable|string|max:255',
        'ville'             => 'nullable|string|max:255',
        'cin_number'        => 'nullable|string|max:20',
        'rib'               => 'nullable|string|size:24',
        'rib_file'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'contract_start'    => 'nullable|date',
        'contract_end'      => 'nullable|date|after:contract_start',
        'contract_renewals' => 'nullable|integer|min:0',
        'car_horsepower'    => 'nullable|integer|min:0|max:9999',
        'cin_file'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'contract_file'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'carte_grise_file'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
    ]);

    $expert->update([
        'nom'               => $request->nom,
        'prenom'            => $request->prenom,
        'email'             => $request->email,
        'telephone'         => $request->telephone,
        'specialite'        => $request->specialite,
        'ville'             => $request->ville,
        'cin_number'        => $request->cin_number,
        'rib'               => $request->rib,
        'contract_start'    => $request->contract_start,
        'contract_end'      => $request->contract_end,
        'contract_renewals' => $request->contract_renewals,
        'car_horsepower'    => $request->car_horsepower,
    ]);

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

    $uploadDate = now()->format('d-m-Y');
    $expertName = str_replace(' ', '_', $expert->nom . '_' . $expert->prenom);

    foreach ([
        'cin_file'         => ['type' => 'cin',        'prefix' => 'CIN'],
        'rib_file'         => ['type' => 'rib',        'prefix' => 'RIB'],
        'contract_file'    => ['type' => 'contract',   'prefix' => 'Contrat'],
        'carte_grise_file' => ['type' => 'carte_grise','prefix' => 'CarteGrise'],
    ] as $field => $meta) {
        if ($request->hasFile($field)) {
            $file      = $request->file($field);
            $extension = $file->getClientOriginalExtension();
            $newName   = $meta['prefix'] . '_' . $expertName . '_' . $uploadDate . '.' . $extension;
            $path      = $file->storeAs("experts/{$expert->id}/{$meta['type']}", $newName, 'private');

            ExpertDocument::create([
                'expert_id'     => $expert->id,
                'type'          => $meta['type'],
                'file_path'     => $path,
                'original_name' => $newName,
                'mime_type'     => $file->getMimeType(),
                'file_size'     => $file->getSize(),
            ]);
        }
    }

    $password = $request->filled('password') ? $request->password : null;
    Mail::to($expert->email)->send(new ExpertAccountUpdated($expert, $password));

    return redirect()->route('si.experts.index');
}

    public function destroy(Expert $expert)
    {
        foreach ($expert->documents as $doc) {
            Storage::disk('private')->delete($doc->file_path);
        }
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