# Diagramme de séquence — Application ANEAQ (Complète)

> Couvre les 4 modules : **SI · DEE · Expert · Établissement**

---

## Flux 1 — Authentification & Routage par rôle

```mermaid
sequenceDiagram
    actor SI as SI (Admin Système)
    actor DEE as DEE (Admin Éval.)
    actor EXP as Expert
    actor ETAB as Établissement
    participant MW as Middleware auth + rôle
    participant DB as Base de données
    participant React as Inertia / React

    SI->>MW: POST /login { email, password }
    MW->>DB: SELECT users WHERE email = ? (role = 'si')
    DB-->>MW: Authentifié
    MW-->>React: redirect /si/dashboard

    DEE->>MW: POST /login { email, password }
    MW->>DB: SELECT users WHERE email = ? (role = 'dee.admin')
    DB-->>MW: Authentifié
    MW-->>React: redirect /dee/dashboard

    EXP->>MW: POST /login { email, password }
    MW->>DB: SELECT users WHERE email = ? (role = 'expert')
    DB-->>MW: Authentifié
    MW-->>React: redirect /expert/dashboard

    ETAB->>MW: POST /login { email, password }
    MW->>DB: SELECT users WHERE email = ? (role = 'etablissement')
    DB-->>MW: Authentifié
    MW-->>React: redirect /etablissement/dashboard
```

---

## Flux 2 — Module SI : Gestion des utilisateurs & experts

```mermaid
sequenceDiagram
    actor SI as SI (Admin Système)
    participant MW as Middleware (role:si)
    participant DB as Base de données
    participant Mail as Service Email
    participant React as Inertia / React

    Note over SI,React: Créer un utilisateur DEE

    SI->>MW: GET /si/utilisateurs-dee/create
    MW-->>React: Formulaire création utilisateur DEE

    SI->>MW: POST /si/utilisateurs-dee { nom, email, password }
    MW->>DB: INSERT users SET role='dee.admin'
    MW->>Mail: Envoi email de bienvenue DEE
    DB-->>MW: Utilisateur créé
    MW-->>React: redirect /si/utilisateurs-dee (flash: Créé)

    SI->>MW: PATCH /si/utilisateurs-dee/{id} { nom, email }
    MW->>DB: UPDATE users
    MW->>Mail: Envoi email de mise à jour
    DB-->>MW: Modifié
    MW-->>React: redirect /si/utilisateurs-dee (flash: Modifié)

    SI->>MW: DELETE /si/utilisateurs-dee/{id}
    MW->>DB: DELETE users
    MW-->>React: redirect /si/utilisateurs-dee (flash: Supprimé)

    Note over SI,React: Créer un expert

    SI->>MW: GET /si/experts/create
    MW-->>React: Formulaire création expert

    SI->>MW: POST /si/experts { profil, documents[] }
    MW->>DB: INSERT experts
    MW->>DB: INSERT expert_documents (CIN, RIB, contrat)
    MW->>DB: INSERT users SET role='expert'
    MW->>Mail: Envoi email de bienvenue expert
    MW->>DB: INSERT activity_log (action: créé)
    DB-->>MW: Expert créé
    MW-->>React: redirect /si/experts/{id}

    SI->>MW: GET /si/historique
    MW->>DB: SELECT activity_log ORDER BY created_at DESC
    DB-->>MW: Journal des actions
    MW-->>React: Page Historique (audit trail)
```

---

## Flux 3 — Module DEE : Campagne & Établissements

```mermaid
sequenceDiagram
    actor DEE as DEE (Admin Éval.)
    participant MW as Middleware (role:dee.admin)
    participant DB as Base de données
    participant Mail as Service Email
    participant React as Inertia / React

    Note over DEE,React: Créer une campagne d'évaluation

    DEE->>MW: GET /dee/campagnes/create
    MW-->>React: Formulaire nouvelle campagne

    DEE->>MW: POST /dee/campagnes { annee, titre, date_debut, date_fin }
    MW->>DB: INSERT campagne_evaluations SET status='brouillon'
    DB-->>MW: Campagne créée
    MW-->>React: redirect /dee/campagnes/{id}

    DEE->>MW: PATCH /dee/campagnes/{id} { status='active' }
    MW->>DB: UPDATE campagne_evaluations
    DB-->>MW: Mise à jour

    Note over DEE,React: Attacher et confirmer les établissements

    DEE->>MW: POST /dee/campagnes/{id}/etablissements/attach { etablissement_ids[] }
    MW->>DB: INSERT campagne_etablissements (pivot)
    DB-->>MW: Établissements attachés
    MW-->>React: flash: "Établissements ajoutés"

    DEE->>MW: POST /dee/campagnes/{id}/etablissements/{pivot}/confirm
    MW->>DB: INSERT users SET role='etablissement' (compte établissement)
    MW->>DB: INSERT dossiers (auto-création du dossier)
    MW->>DB: UPDATE campagne_etablissements SET status='confirme'
    MW->>Mail: Envoi email d'accès à l'établissement
    DB-->>MW: Confirmation faite
    MW-->>React: flash: "Établissement confirmé, dossier créé"

    DEE->>MW: DELETE /dee/campagnes/{id}/etablissements/{pivot}/refuse
    MW->>DB: UPDATE campagne_etablissements SET status='refuse'
    DB-->>MW: Refus enregistré
    MW-->>React: flash: "Établissement refusé"
```

---

## Flux 4 — Module DEE : Dossiers & Affectation des experts

```mermaid
sequenceDiagram
    actor DEE as DEE (Admin Éval.)
    participant MW as Middleware (role:dee.admin)
    participant DB as Base de données
    participant Mail as Service Email
    participant React as Inertia / React

    Note over DEE,React: Gestion des dossiers

    DEE->>MW: GET /dee/dossiers
    MW->>DB: SELECT dossiers + etablissements + campagnes (avec filtres)
    DB-->>MW: Liste des dossiers
    MW-->>React: Page Dossiers/Index

    DEE->>MW: GET /dee/dossiers/{id}
    MW->>DB: SELECT dossier + experts affectés + documents + timeline
    DB-->>MW: Données complètes
    MW-->>React: Page Dossiers/Show

    DEE->>MW: PATCH /dee/dossiers/{id} { statut, date_visite, observation }
    MW->>DB: UPDATE dossiers
    DB-->>MW: Mise à jour
    MW-->>React: flash: "Dossier modifié"

    DEE->>MW: POST /dee/dossiers/{dossier}/documents { fichier }
    MW->>DB: INSERT dossier_documents (upload stocké)
    DB-->>MW: Document enregistré

    Note over DEE,React: Affecter un expert à un dossier

    DEE->>MW: POST /dee/dossiers/{dossier}/experts { expert_id, role }
    MW->>DB: INSERT dossier_experts SET status='en_attente_confirmation_dee', role=?
    DB-->>MW: Expert assigné (en attente)
    MW-->>React: flash: "Expert assigné"

    DEE->>MW: POST /dee/dossiers/{dossier}/experts/{assignment}/confirm
    MW->>DB: CREATE/UPDATE users (compte expert) SET role='expert'
    MW->>DB: UPDATE dossier_experts SET status='acces_envoye'
    MW->>DB: SET invitation_token = uuid(), access_sent_at = NOW()
    MW->>Mail: Email invitation avec lien token
    DB-->>MW: Confirmation envoyée
    MW-->>React: flash: "Expert confirmé, invitation envoyée"

    DEE->>MW: DELETE /dee/dossiers/{dossier}/experts/{assignment}/refuse
    MW->>DB: UPDATE dossier_experts SET status='refuse_par_dee'
    DB-->>MW: Refus enregistré

    DEE->>MW: DELETE /dee/dossiers/{dossier}/experts/{assignment} { password }
    MW->>DB: DELETE dossier_experts (vérification mot de passe)
    DB-->>MW: Supprimé

    Note over DEE,React: Workflow de suivi

    DEE->>MW: GET /dee/workflow/affectations
    MW->>DB: SELECT dossier_experts + statuts + profils experts
    DB-->>MW: Vue d'ensemble des affectations
    MW-->>React: Tableau workflow affectations

    DEE->>MW: GET /dee/workflow/comites
    MW->>DB: SELECT comités (min 1 chef + 2 experts confirmés)
    DB-->>MW: État de chaque comité
    MW-->>React: Vue comités

    DEE->>MW: GET /dee/workflow/visites
    MW->>DB: SELECT dossiers WHERE date_visite IS NOT NULL
    DB-->>MW: Planning des visites terrain
    MW-->>React: Vue planning visites
```

---

## Flux 5 — Module Expert : Invitation & Participation

```mermaid
sequenceDiagram
    actor EXP as Expert
    participant MW as Middleware (role:expert)
    participant DB as Base de données
    participant React as Inertia / React

    Note over EXP,React: Réception de l'invitation par email

    EXP->>MW: GET /experts/invitation/{token}/confirm
    MW->>DB: SELECT dossier_experts WHERE invitation_token = ?
    MW->>DB: UPDATE status='en_attente_confirmation_expert'
    MW-->>React: redirect /expert/dashboard

    Note over EXP,React: Tableau de bord expert

    EXP->>MW: GET /expert/dashboard
    MW->>DB: findExpertForUser(user_id) → SELECT experts
    MW->>DB: SELECT dossier_experts status IN [en_attente, acces_envoye]
    DB-->>MW: Invitations en attente + stats
    MW-->>React: Page Dashboard (invitations + statistiques)

    Note over EXP,React: Page Mes invitations (toutes participations)

    EXP->>MW: GET /expert/participations
    MW->>DB: SELECT dossier_experts WHERE expert_id = ?
    MW->>DB: JOIN dossiers + etablissements + campagnes
    DB-->>MW: Participations (en attente / confirmées / refusées)
    MW-->>React: Page Participations/Index (3 sections en tableau)

    Note over EXP,React: Accepter une invitation

    EXP->>MW: POST /expert/affectations/{id}/accept
    MW->>DB: authorizeExpertAffectation(id, expert)
    DB-->>MW: Autorisé
    MW->>DB: UPDATE dossier_experts SET status='confirme_par_expert'
    MW->>DB: SET expert_confirmed_at = NOW()
    MW->>DB: updateDossierCommitteeStatus() — comité complet ?
    DB-->>MW: Mis à jour
    MW-->>React: redirect /expert/participations (flash: Confirmée)

    Note over EXP,React: Refuser une invitation

    EXP->>React: Clic "Refuser" → window.prompt(motif)
    React-->>EXP: Saisie du motif
    EXP->>MW: POST /expert/affectations/{id}/refuse { motif_refus }
    MW->>DB: authorizeExpertAffectation(id, expert)
    MW->>DB: UPDATE dossier_experts SET status='refuse_par_expert'
    MW->>DB: SET expert_refused_at = NOW(), motif_refus = ?
    DB-->>MW: Refus enregistré
    MW-->>React: redirect /expert/participations (flash: Refusée)
```

---

## Flux 6 — Module Expert : Évaluation, Rapport & Recommandations

```mermaid
sequenceDiagram
    actor EXP as Expert
    participant MW as Middleware (role:expert)
    participant DB as Base de données
    participant React as Inertia / React

    Note over EXP,React: Accès au dossier confirmé

    EXP->>MW: GET /expert/dossiers/{id}
    MW->>DB: confirmedAssignmentsForExpert(expert)
    MW->>DB: authorizeDossier() — status confirmé requis
    alt Accès autorisé
        MW->>DB: SELECT dossier + comité + progression + rapports
        DB-->>MW: Données complètes
        MW-->>React: Page Dossiers/Show (progression + actions)
    else Accès refusé
        MW-->>EXP: 403 Accès non autorisé
    end

    Note over EXP,React: Évaluation quantitative

    EXP->>MW: GET /expert/evaluations/{dossier}
    MW->>DB: SELECT criteres_evaluation (grille hiérarchique)
    MW->>DB: SELECT evaluations_quantitatives (réponses existantes)
    DB-->>MW: Grille + réponses brouillon
    MW-->>React: Formulaire évaluation quantitative

    EXP->>MW: POST /expert/evaluations/{dossier}/sauvegarder { scores[] }
    MW->>DB: UPSERT evaluations_quantitatives SET status='brouillon'
    DB-->>MW: Sauvegardé
    MW-->>React: flash: "Brouillon sauvegardé"

    EXP->>MW: POST /expert/evaluations/{dossier}/soumettre
    MW->>DB: UPDATE evaluations_quantitatives SET status='soumis'
    MW->>DB: INSERT notification_aneaq (notifier DEE)
    DB-->>MW: Soumis
    MW-->>React: redirect (flash: "Évaluation soumise au DEE")

    Note over EXP,React: Dépôt du rapport

    EXP->>MW: GET /expert/rapports/{dossier}/deposer
    MW-->>React: Formulaire dépôt rapport

    EXP->>MW: POST /expert/rapports/{dossier} { fichier }
    MW->>DB: INSERT rapport_experts (fichier stocké)
    DB-->>MW: Rapport enregistré
    MW-->>React: redirect /expert/rapports (flash: "Rapport déposé")

    EXP->>MW: GET /expert/rapports/{rapport}/telecharger
    MW->>DB: SELECT rapport_experts
    MW-->>EXP: Téléchargement fichier

    Note over EXP,React: Matrice de recommandations

    EXP->>MW: GET /expert/recommandations/{dossier}
    MW->>DB: SELECT matrice_recommandations (brouillon)
    DB-->>MW: Données matrice
    MW-->>React: Formulaire recommandations

    EXP->>MW: POST /expert/recommandations/{dossier}/sauvegarder { matrix[] }
    MW->>DB: UPSERT matrice_recommandations SET status='brouillon'
    DB-->>MW: Sauvegardé

    EXP->>MW: POST /expert/recommandations/{dossier}/soumettre
    MW->>DB: UPDATE matrice_recommandations SET status='soumis'
    MW->>DB: INSERT notification_aneaq (notifier DEE)
    DB-->>MW: Soumis
    MW-->>React: redirect (flash: "Recommandations soumises")

    Note over EXP,React: Notifications

    EXP->>MW: GET /expert/notifications
    MW->>DB: SELECT notification_aneaq WHERE user_id = ? (paginé)
    DB-->>MW: Liste notifications
    MW-->>React: Page Notifications/Index

    EXP->>MW: PATCH /expert/notifications/{id}/lire
    MW->>DB: UPDATE notification_aneaq SET lu=true
    DB-->>MW: Marqué comme lu
```

---

## Flux 7 — Module Établissement : Profil & Documents

```mermaid
sequenceDiagram
    actor ETAB as Établissement
    participant MW as Middleware (role:etablissement)
    participant DB as Base de données
    participant React as Inertia / React

    Note over ETAB,React: Tableau de bord

    ETAB->>MW: GET /etablissement/dashboard
    MW->>DB: SELECT dossier + tâches en cours + notifications
    DB-->>MW: Données du tableau de bord
    MW-->>React: Page Dashboard (timeline + tâches + alertes)

    Note over ETAB,React: Compléter le profil

    ETAB->>MW: GET /etablissement/profil/modifier
    MW->>DB: SELECT etablissement + onboarding status
    DB-->>MW: Profil actuel
    MW-->>React: Formulaire édition profil

    ETAB->>MW: PATCH /etablissement/profil { contact, adresse, responsable, ville }
    MW->>DB: UPDATE etablissements
    MW->>DB: UPDATE etablissement_onboarding SET profil_complete=true
    DB-->>MW: Profil mis à jour
    MW-->>React: redirect /etablissement/profil (flash: "Profil sauvegardé")

    Note over ETAB,React: Gestion des documents

    ETAB->>MW: GET /etablissement/documents
    MW->>DB: SELECT documents WHERE etablissement_id = ?
    DB-->>MW: Liste des documents
    MW-->>React: Page Documents/Index

    ETAB->>MW: POST /etablissement/documents { fichier, type_document }
    MW->>DB: INSERT documents (fichier stocké)
    DB-->>MW: Document enregistré
    MW-->>React: flash: "Document téléversé"

    ETAB->>MW: GET /etablissement/documents/{id}/telecharger
    MW->>DB: SELECT documents WHERE id = ? AND etablissement_id = ?
    MW-->>ETAB: Téléchargement fichier
```

---

## Vue d'ensemble des statuts — `dossier_experts.status`

```mermaid
stateDiagram-v2
    [*] --> en_attente_confirmation_dee : Expert assigné par DEE
    en_attente_confirmation_dee --> acces_envoye : DEE confirme (email envoyé)
    en_attente_confirmation_dee --> refuse_par_dee : DEE refuse
    acces_envoye --> en_attente_confirmation_expert : Expert clique le lien token
    en_attente_confirmation_expert --> confirme_par_expert : Expert accepte
    en_attente_confirmation_expert --> refuse_par_expert : Expert refuse
    confirme_par_expert --> comite_confirme : Tout le comité accepte
    refuse_par_dee --> [*]
    refuse_par_expert --> [*]
    comite_confirme --> [*]
```

---

## Récapitulatif des rôles et accès

| Rôle | Préfixe URL | Accès principal |
|------|-------------|-----------------|
| `si` | `/si` | Gestion utilisateurs DEE + experts + historique |
| `dee.admin` | `/dee` | Campagnes, dossiers, affectation experts, workflow |
| `expert` | `/expert` | Participations, évaluations, rapports, recommandations |
| `etablissement` | `/etablissement` | Profil, documents, suivi dossier |
