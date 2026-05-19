<?php

namespace App\Http\Controllers;

use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\NotificationAneaq;
use App\Models\QuestionReponse;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QuestionsReponsesController extends Controller
{
    public function indexDee(Request $request)
    {
        $statut = $request->get('statut', '');
        $search = $request->get('search', '');

        $questions = QuestionReponse::with([
                'dossier:id,reference,etablissement_id',
                'dossier.etablissement:id,etablissement,etablissement_2,acronyme',
                'user:id,name',
                'reponduPar:id,name',
            ])
            ->when($statut, fn ($q) => $q->where('statut', $statut))
            ->when($search, fn ($q) => $q->where('question', 'like', "%$search%")
                ->orWhereHas('dossier', fn ($q2) => $q2->where('reference', 'like', "%$search%")))
            ->orderByRaw("statut = 'en_attente' DESC")
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($q) => $this->formatQuestion($q));

        return Inertia::render('DEE/QuestionsReponses', [
            'questions' => $questions,
            'filters'   => compact('statut', 'search'),
            'pending'   => QuestionReponse::where('statut', 'en_attente')->count(),
        ]);
    }

    public function repondre(Request $request, QuestionReponse $question)
    {
        $request->validate(['reponse' => 'required|string|max:5000']);

        $question->update([
            'reponse'     => $request->reponse,
            'repondu_par' => Auth::id(),
            'repondu_le'  => now(),
            'statut'      => 'repondu',
        ]);

        // Notify the établissement user
        $dossier = Dossier::find($question->dossier_id);
        $etablissement = $dossier ? Etablissement::where('id', $dossier->etablissement_id)->first() : null;
        if ($etablissement?->user_id) {
            NotificationAneaq::envoyer(
                $etablissement->user_id, 'reponse',
                'Réponse reçue',
                'La DEE a répondu à votre question : « ' . Str::limit($question->question, 80) . ' »',
                'Dossier', $dossier->id
            );
        }

        if ($dossier) {
            ActivityLogger::log('question_repondue', "La DEE a répondu à une question pour le dossier {$dossier->reference}", $dossier);
        }

        return back()->with('success', 'Réponse enregistrée.');
    }

    public function indexEtablissement(Dossier $dossier)
    {
        $questions = QuestionReponse::where('dossier_id', $dossier->id)
            ->where('user_id', Auth::id())
            ->with('reponduPar:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($q) => $this->formatQuestion($q));

        return Inertia::render('Etablissement/QuestionsReponses', [
            'dossier'   => $dossier->only('id', 'reference'),
            'questions' => $questions,
        ]);
    }

    public function poserQuestion(Request $request, Dossier $dossier)
    {
        $request->validate(['question' => 'required|string|max:2000']);

        QuestionReponse::create([
            'dossier_id' => $dossier->id,
            'user_id'    => Auth::id(),
            'question'   => $request->question,
        ]);

        NotificationAneaq::envoyer(
            Auth::id(), 'question',
            'Question envoyée',
            'Votre question a été transmise à la DEE. Vous serez notifié dès réception d\'une réponse.',
            'Dossier', $dossier->id
        );

        ActivityLogger::log('question_posee', "Question posée pour le dossier {$dossier->reference}", $dossier);

        return back()->with('success', 'Question envoyée. Vous serez notifié dès qu\'une réponse est disponible.');
    }

    private function formatQuestion(QuestionReponse $q): array
    {
        return [
            'id'           => $q->id,
            'question'     => $q->question,
            'reponse'      => $q->reponse,
            'statut'       => $q->statut,
            'auteur'       => $q->user?->name ?? 'Inconnu',
            'repondu_par'  => $q->reponduPar?->name,
            'repondu_le'   => $q->repondu_le?->format('d/m/Y H:i'),
            'created_at'   => $q->created_at?->format('d/m/Y H:i'),
            'dossier'      => $q->dossier ? [
                'id'            => $q->dossier->id,
                'reference'     => $q->dossier->reference,
                'etablissement' => $q->dossier->etablissement?->etablissement_2
                    ?? $q->dossier->etablissement?->etablissement
                    ?? $q->dossier->etablissement?->acronyme,
            ] : null,
        ];
    }
}
