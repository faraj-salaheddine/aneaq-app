# Diagramme de séquence — Demandes de participation Expert

```mermaid
sequenceDiagram
    actor Expert as 👤 Expert (Navigateur)
    participant MW as Middleware<br/>auth + role:expert
    participant DB as Base de données<br/>(dossier_experts / experts / users)
    participant DashCtrl as ExpertDashboardController
    participant PartCtrl as ParticipationController
    participant DossierCtrl as DossierExpertController
    participant React as Pages React (Inertia.js)

    %% ══════════════════════════════════════════
    Note over Expert,React: ① AUTHENTIFICATION
    %% ══════════════════════════════════════════

    Expert->>MW: POST /login { email, password }
    MW->>DB: SELECT user WHERE email = ? AND role = 'expert'
    DB-->>MW: ✓ Utilisateur trouvé
    MW-->>Expert: Session créée → redirect /expert/dashboard

    %% ══════════════════════════════════════════
    Note over Expert,React: ② INVITATION PAR EMAIL (token)
    %% ══════════════════════════════════════════

    Expert->>MW: GET /experts/invitation/{token}/confirm
    MW->>DB: SELECT dossier_experts WHERE invitation_token = ?
    DB-->>MW: Affectation trouvée
    MW->>DB: UPDATE dossier_experts<br/>SET status = 'acces_envoye'<br/>SET access_sent_at = NOW()
    MW-->>Expert: redirect /expert/dashboard

    %% ══════════════════════════════════════════
    Note over Expert,React: ③ TABLEAU DE BORD
    %% ══════════════════════════════════════════

    Expert->>DashCtrl: GET /expert/dashboard
    DashCtrl->>DB: findExpertForUser(auth()->id())<br/>SELECT experts WHERE user_id = ?
    DB-->>DashCtrl: Expert trouvé (avec profil)
    DashCtrl->>DB: getAffectationsForExpert(expert)<br/>status IN [en_attente_confirmation_expert, acces_envoye]
    DB-->>DashCtrl: Affectations en attente + stats
    DashCtrl-->>React: Inertia::render('Expert/Dashboard',<br/>{ expert, affectations, stats })
    React-->>Expert: 📊 Dashboard avec invitations en attente

    %% ══════════════════════════════════════════
    Note over Expert,React: ④ PAGE MES INVITATIONS
    %% ══════════════════════════════════════════

    Expert->>PartCtrl: GET /expert/participations
    PartCtrl->>DB: findExpertForUser(auth()->id())
    DB-->>PartCtrl: Expert trouvé
    PartCtrl->>DB: SELECT dossier_experts WHERE expert_id = ?<br/>avec dossier + etablissement + campagne
    DB-->>PartCtrl: Toutes les participations (tous statuts)
    PartCtrl-->>React: Inertia::render('Expert/Participations/Index',<br/>{ participations, stats: {total, en_attente, confirmees, refusees} })
    React-->>Expert: 📋 Tableau tri-sections:<br/>En attente | Confirmées | Refusées

    %% ══════════════════════════════════════════
    Note over Expert,React: ⑤ ACCEPTER UNE INVITATION
    %% ══════════════════════════════════════════

    Expert->>DashCtrl: POST /expert/affectations/{dossierExpert}/accept
    DashCtrl->>DB: authorizeExpertAffectation(id, expert)<br/>Vérifie que l'affectation appartient à cet expert
    DB-->>DashCtrl: ✓ Autorisé
    DashCtrl->>DB: UPDATE dossier_experts<br/>SET status = 'confirme_par_expert'<br/>SET expert_confirmed_at = NOW()
    DashCtrl->>DB: updateDossierCommitteeStatus(dossier)<br/>Vérifie si tout le comité est confirmé
    DB-->>DashCtrl: ✓ Mis à jour
    DashCtrl-->>Expert: redirect /expert/participations<br/>flash: "Participation confirmée avec succès"
    Expert->>PartCtrl: GET /expert/participations (rechargement)
    PartCtrl-->>React: Participations actualisées
    React-->>Expert: ✅ Dossier apparaît dans "Confirmées"

    %% ══════════════════════════════════════════
    Note over Expert,React: ⑥ REFUSER UNE INVITATION
    %% ══════════════════════════════════════════

    Expert->>React: Clic "Refuser" → window.prompt("Motif du refus")
    React-->>Expert: Saisie du motif
    Expert->>DashCtrl: POST /expert/affectations/{dossierExpert}/refuse<br/>{ motif_refus: "..." }
    DashCtrl->>DB: authorizeExpertAffectation(id, expert)
    DB-->>DashCtrl: ✓ Autorisé
    DashCtrl->>DB: UPDATE dossier_experts<br/>SET status = 'refuse_par_expert'<br/>SET expert_refused_at = NOW()<br/>SET motif_refus = "..."
    DB-->>DashCtrl: ✓ Refus enregistré
    DashCtrl-->>Expert: redirect /expert/participations<br/>flash: "Participation refusée"
    React-->>Expert: ❌ Dossier apparaît dans "Refusées" + motif affiché

    %% ══════════════════════════════════════════
    Note over Expert,React: ⑦ ACCÈS AU DOSSIER
    %% ══════════════════════════════════════════

    Expert->>DossierCtrl: GET /expert/dossiers/{dossier}<br/>(bouton "Ouvrir" section Confirmées)
    DossierCtrl->>DB: findExpertForUser(auth()->id())
    DB-->>DossierCtrl: Expert trouvé
    DossierCtrl->>DB: confirmedAssignmentsForExpert(expert)<br/>status IN [confirme_par_expert, comite_confirme]
    DB-->>DossierCtrl: IDs des dossiers autorisés

    alt ✅ Dossier dans la liste autorisée
        DossierCtrl->>DB: findEtablissementForDossier(dossier)
        DossierCtrl->>DB: getComiteForDossier(dossier)
        DossierCtrl->>DB: calculateProgression(dossier)
        DB-->>DossierCtrl: Données complètes
        DossierCtrl-->>React: Inertia::render('Expert/Dossiers/Show',<br/>{ dossier, etablissement, comite, progression })
        React-->>Expert: 📁 Détail dossier + progression évaluation
    else ❌ Dossier non autorisé
        DossierCtrl-->>Expert: abort(403) — Accès refusé
    end

    %% ══════════════════════════════════════════
    Note over Expert,React: ⑧ DÉCONNEXION
    %% ══════════════════════════════════════════

    Expert->>MW: POST /logout
    MW->>DB: Invalider session
    MW-->>Expert: redirect /login
```

## Résumé des acteurs

| Acteur | Rôle |
|--------|------|
| **Expert** | Utilisateur authentifié avec rôle `expert` |
| **Middleware** | Vérifie l'authentification + le rôle à chaque requête |
| **Base de données** | Table principale : `dossier_experts` (pivot expert ↔ dossier) |
| **ExpertDashboardController** | Gère le dashboard + les actions accept/refuse |
| **ParticipationController** | Gère la liste complète des participations |
| **DossierExpertController** | Gère l'accès aux dossiers confirmés |
| **React / Inertia.js** | Rendu des pages côté client |

## Statuts du flux (`dossier_experts.status`)

```
en_attente_confirmation_dee
         ↓
  acces_envoye  ←─── Invitation email (token)
         ↓
en_attente_confirmation_expert
         ↓                    ↓
confirme_par_expert    refuse_par_expert
         ↓
  comite_confirme  ←─── Quand tout le comité accepte
```
