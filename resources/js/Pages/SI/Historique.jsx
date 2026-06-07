// resources/js/Pages/SI/Historique.jsx

import { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#ef4444";
const PURPLE = "#7e22ce";

const ACTION_LABEL = {
    // SI legacy
    "Compte créé":    "Compte créé",
    "Compte modifié": "Compte modifié",
    "Compte supprimé":"Compte supprimé",
    // Dossier
    dossier_cree:                       "Dossier créé",
    dossier_mis_a_jour:                 "Dossier modifié",
    dossier_modifie:                    "Dossier modifié",
    dossier_supprime:                   "Dossier supprimé",
    statut_modifie:                     "Statut modifié",
    // Expert / affectation
    expert_affecte:                     "Expert affecté",
    expert_confirme:                    "Expert confirmé",
    expert_retire:                      "Expert retiré",
    affectation_confirmee:              "Affectation confirmée",
    // Rapport
    rapport_depose:                     "Rapport déposé",
    rapport_envoye_etablissement:       "Rapport envoyé étab.",
    rapport_expert_ajoute:              "Rapport expert ajouté",
    rapport_valide:                     "Rapport validé",
    rapport_rejete:                     "Rapport refusé",
    // Documents / annexes
    annexe_enregistree:                 "Annexe enregistrée",
    annexes_publiees:                   "Annexes publiées",
    document_ajoute:                    "Document ajouté",
    document_supprime:                  "Document supprimé",
    document_complementaire_depose:     "Document complémentaire",
    // Évaluation
    evaluation_annexe_brouillon:        "Évaluation brouillon",
    evaluation_annexe_soumise:          "Évaluation soumise",
    preuves_brouillon:                  "Preuves brouillon",
    // Recommandations
    recommandation_brouillon_ajoutee:   "Recommandation ajoutée",
    recommandation_brouillon_supprimee: "Recommandation supprimée",
    recommandations_soumises_dee:       "Recommandations soumises",
    recommandations_acceptees_envoyees: "Recommandations envoyées",
    rappel_recommandations:             "Rappel recommandations",
    // Q&R / profil / visite
    question_posee:                     "Question posée",
    question_repondue:                  "Question répondue",
    visite_planifiee:                   "Visite planifiée",
    profil_mis_a_jour:                  "Profil mis à jour",
    // SI — utilisateurs DEE
    utilisateur_dee_cree:               "Utilisateur DEE créé",
    utilisateur_dee_modifie:            "Utilisateur DEE modifié",
    utilisateur_dee_supprime:           "Utilisateur DEE supprimé",
    profil_si_modifie:                  "Profil SI modifié",
    // SI — gestion comptes
    compte_active:                      "Compte activé",
    compte_desactive:                   "Compte désactivé",
    mot_de_passe_reinitialise:          "Mot de passe réinitialisé",
};

const humanize = (s) => ACTION_LABEL[s] || (s || "—").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const actionColor = (s) => {
    if (!s) return { color: "#64748b", bg: "#f1f5f9" };
    if (s.includes("cree") || s.includes("créé") || s.includes("ajoute")) return { color: GREEN,  bg: `${GREEN}15`  };
    if (s.includes("supprime") || s.includes("rejete") || s.includes("retire")) return { color: RED, bg: `${RED}12` };
    if (s.includes("envoye") || s.includes("posee") || s.includes("repondue")) return { color: "#0891b2", bg: "#e0f2fe" };
    return { color: BLUE, bg: `${BLUE}12` };
};

const ROLE_META = {
    si:           { label: "SI",           color: BLUE,   bg: `${BLUE}12`    },
    expert:       { label: "Expert",       color: GREEN,  bg: `${GREEN}12`   },
    dee:          { label: "DEE",          color: PURPLE, bg: `${PURPLE}12`  },
    admin_dee:    { label: "Admin DEE",    color: PURPLE, bg: `${PURPLE}12`  },
    chef_dee:     { label: "Chef DEE",     color: ORANGE, bg: `${ORANGE}12`  },
    etablissement:{ label: "Établissement",color: "#0891b2", bg: "#e0f2fe"   },
};

// Accepts both short names ("Dossier") and full namespace ("App\\Models\\Dossier")
const MODEL_LABELS = {
    Expert:         { label: "Expert",          color: GREEN   },
    UtilisateurDEE: { label: "Utilisateur DEE", color: PURPLE  },
    User:           { label: "Utilisateur",     color: BLUE    },
    Dossier:        { label: "Dossier",         color: "#0891b2" },
    Etablissement:  { label: "Établissement",   color: ORANGE  },
    Campagne:       { label: "Campagne",        color: "#8b5cf6" },
    RapportExpert:  { label: "Rapport expert",  color: GREEN   },
};
const getModelMeta = (raw) => {
    if (!raw) return { label: "—", color: "#94a3b8" };
    const short = raw.includes("\\") ? raw.split("\\").pop() : raw;
    return MODEL_LABELS[short] || { label: short, color: "#64748b" };
};

export default function Historique({ logs = [] }) {
    const [search, setSearch]       = useState("");
    const [actionFilter, setAction] = useState("");
    const [roleFilter, setRole]     = useState("");
    const [modelFilter, setModel]   = useState("");
    const [dateFrom, setDateFrom]   = useState("");
    const [dateTo, setDateTo]       = useState("");
    const [page, setPage]           = useState(1);
    const [showClearModal, setShowClearModal] = useState(false);
    const pageSize = 20;

    const actions = [...new Set(logs.map(l => l.action).filter(Boolean))];
    const roles   = [...new Set(logs.map(l => l.role).filter(Boolean))];
    const models  = [...new Set(logs.map(l => l.model_type).filter(Boolean))];

    const filtered = useMemo(() => logs.filter(l => {
        const s = search.toLowerCase();
        const matchSearch = !s || [l.model_name, l.performed_by, l.details, l.action].some(v => (v || "").toLowerCase().includes(s));
        const matchAction = !actionFilter || l.action === actionFilter;
        const matchRole   = !roleFilter   || l.role === roleFilter;
        const matchModel  = !modelFilter  || l.model_type === modelFilter;
        const matchFrom   = !dateFrom     || l.created_at >= dateFrom;
        const matchTo     = !dateTo       || l.created_at <= dateTo + " 23:59";
        return matchSearch && matchAction && matchRole && matchModel && matchFrom && matchTo;
    }), [logs, search, actionFilter, roleFilter, modelFilter, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

    const resetAll = () => { setSearch(""); setAction(""); setRole(""); setModel(""); setDateFrom(""); setDateTo(""); setPage(1); };
    const activeFilters = [search, actionFilter, roleFilter, modelFilter, dateFrom, dateTo].filter(Boolean).length;

    return (
        <>
            <Head title="Historique — ANEAQ" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .hist-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .filter-input:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px rgba(12,68,124,0.08) !important; outline: none; }
                .log-row:hover { background: #f8fafc !important; }
                .page-btn:hover { background: #f1f5f9 !important; }
            `}</style>

            <div className="hist-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Système d'Information</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Historique</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #475569, #334155)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(71,85,105,0.3)" }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Historique des activités</h1>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0", fontWeight: 500 }}>
                                    <span style={{ color: "#475569", fontWeight: 700 }}>{filtered.length}</span> entrée{filtered.length !== 1 ? "s" : ""} · {logs.length} au total
                                </p>
                            </div>
                        </div>

                        {/* Stats pills + clear button */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                            onClick={() => setShowClearModal(true)}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff", color: RED, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            Vider l'historique
                        </button>
                            {[
                                { label: "Créations",    color: GREEN,  value: logs.filter(l => ["Compte créé","dossier_cree","annexe_enregistree","annexes_publiees","document_complementaire_depose","document_ajoute","rapport_depose","recommandation_brouillon_ajoutee","rapport_expert_ajoute","utilisateur_dee_cree"].includes(l.action)).length },
                                { label: "Modifications",color: BLUE,   value: logs.filter(l => ["Compte modifié","dossier_mis_a_jour","dossier_modifie","statut_modifie","expert_affecte","expert_confirme","affectation_confirmee","preuves_brouillon","profil_mis_a_jour","profil_si_modifie","evaluation_annexe_brouillon","evaluation_annexe_soumise","recommandations_soumises_dee","recommandations_acceptees_envoyees","rappel_recommandations","question_posee","question_repondue","rapport_envoye_etablissement","rapport_valide","rapport_rejete","visite_planifiee","utilisateur_dee_modifie","compte_active","compte_desactive","mot_de_passe_reinitialise"].includes(l.action)).length },
                                { label: "Suppressions", color: RED,    value: logs.filter(l => ["Compte supprimé","dossier_supprime","document_supprime","expert_retire","recommandation_brouillon_supprimee","utilisateur_dee_supprime"].includes(l.action)).length },
                            ].map((s, i) => (
                                <div key={i} style={{ padding: "8px 16px", borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{s.value}</span>
                                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            {/* ── Clear confirmation modal ── */}
            {showClearModal && (
                <div onClick={() => setShowClearModal(false)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: "32px 28px", width: 420, maxWidth: "90vw", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Vider l'historique</h3>
                        <p style={{ fontSize: 14, color: "#475569", margin: "0 0 24px", lineHeight: 1.6 }}>
                            Cette action supprimera définitivement toutes les <strong>{logs.length}</strong> entrées de l'historique. Elle est irréversible.
                        </p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setShowClearModal(false)} style={{ padding: "9px 20px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                Annuler
                            </button>
                            <button
                                onClick={() => { setShowClearModal(false); router.delete("/si/historique"); }}
                                style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: RED, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                            >
                                Vider définitivement
                            </button>
                        </div>
                    </div>
                </div>
            )}

                {/* ── Main panel ── */}
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                    {/* Toolbar */}
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: "#fafbfc" }}>

                        {/* Search */}
                        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            </span>
                            <input className="filter-input" type="text" placeholder="Rechercher..."
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff" }}
                            />
                        </div>

                        {/* Action filter */}
                        <select className="filter-input" value={actionFilter} onChange={e => { setAction(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: actionFilter ? `1.5px solid ${BLUE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: actionFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            <option value="">Toutes les actions</option>
                            {actions.map(a => <option key={a} value={a}>{humanize(a)}</option>)}
                        </select>

                        {/* Role filter */}
                        <select className="filter-input" value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: roleFilter ? `1.5px solid ${PURPLE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: roleFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            <option value="">Tous les rôles</option>
                            {roles.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
                        </select>

                        {/* Model filter */}
                        <select className="filter-input" value={modelFilter} onChange={e => { setModel(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: modelFilter ? `1.5px solid ${GREEN}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: modelFilter ? "#0f172a" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
                        >
                            <option value="">Tous les types</option>
                            {models.map(m => <option key={m} value={m}>{getModelMeta(m).label}</option>)}
                        </select>

                        {/* Date from */}
                        <input className="filter-input" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: dateFrom ? `1.5px solid ${ORANGE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: dateFrom ? "#0f172a" : "#94a3b8", background: "#fff", outline: "none", cursor: "pointer" }}
                        />

                        {/* Date to */}
                        <input className="filter-input" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                            style={{ padding: "8px 12px", border: dateTo ? `1.5px solid ${ORANGE}` : "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: dateTo ? "#0f172a" : "#94a3b8", background: "#fff", outline: "none", cursor: "pointer" }}
                        />

                        {/* Reset */}
                        {activeFilters > 0 && (
                            <button onClick={resetAll}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Effacer ({activeFilters})
                            </button>
                        )}
                    </div>

                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "44px 160px 140px 120px 1fr 160px", padding: "10px 24px", background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                        {["", "Action", "Type", "Rôle", "Détails", "Date"].map((col, i) => (
                            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase" }}>{col}</span>
                        ))}
                    </div>

                    {/* Rows */}
                    {paginated.length === 0 ? (
                        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f1f5f9", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>Aucune activité trouvée</p>
                            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Essayez d'autres critères de recherche</p>
                        </div>
                    ) : paginated.map((log, i) => {
                        const aMeta    = actionColor(log.action);
                        const roleMeta = ROLE_META[log.role] || { label: log.role || "—", color: "#64748b", bg: "#f1f5f9" };
                        const mMeta    = getModelMeta(log.model_type);
                        return (
                            <div key={log.id} className="log-row"
                                style={{ display: "grid", gridTemplateColumns: "44px 160px 140px 120px 1fr 160px", padding: "13px 24px", borderBottom: i < paginated.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", transition: "background 0.1s" }}
                            >
                                {/* Icon */}
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: aMeta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={aMeta.color} strokeWidth="2">
                                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                </div>

                                {/* Action + who */}
                                <div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: aMeta.color, display: "block" }}>{humanize(log.action)}</span>
                                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>par {log.performed_by}</span>
                                </div>

                                {/* Model type + name */}
                                <div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: mMeta.color, display: "block" }}>{mMeta.label}</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 130 }}>{log.model_name}</span>
                                </div>

                                {/* Role badge */}
                                <div>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: roleMeta.bg, color: roleMeta.color }}>
                                        {roleMeta.label}
                                    </span>
                                </div>

                                {/* Details */}
<div style={{ minWidth: 0 }}>
    {log.details && log.details.includes('→') ? (
        <details style={{ cursor: "pointer" }}>
            <summary style={{ fontSize: 12, color: BLUE, fontWeight: 600, listStyle: "none", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                Voir les modifications
            </summary>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {log.details.split(' | ').map((change, idx) => {
                    const [field, rest] = change.split(': ');
                    const [from, to]   = (rest || '').split(' → ');
                    return (
                        <div key={idx} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, color: "#374151" }}>{field}:</span>
                            <span style={{ padding: "1px 6px", borderRadius: 4, background: "#fee2e2", color: "#991b1b", fontFamily: "'DM Mono', monospace" }}>{from}</span>
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            <span style={{ padding: "1px 6px", borderRadius: 4, background: "#dcfce7", color: "#166534", fontFamily: "'DM Mono', monospace" }}>{to}</span>
                        </div>
                    );
                })}
            </div>
        </details>
    ) : (
        <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            {log.description || log.details || "—"}
        </span>
    )}
</div>

                                {/* Date */}
                                <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
                                    {log.created_at}
                                </span>
                            </div>
                        );
                    })}

                    {/* Footer / Pagination */}
                    {filtered.length > 0 && (
                        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                Affichage de <strong style={{ color: "#374151" }}>{(page - 1) * pageSize + 1}</strong>–<strong style={{ color: "#374151" }}>{Math.min(page * pageSize, filtered.length)}</strong> sur <strong style={{ color: "#374151" }}>{filtered.length}</strong> entrées
                            </span>

                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: page === 1 ? "#cbd5e1" : "#475569" }}
                                >
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                                    Précédent
                                </button>

                                <div style={{ display: "flex", gap: 3 }}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                        .reduce((acc, p, idx, arr) => {
                                            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, idx) => p === "..." ? (
                                            <span key={`dots-${idx}`} style={{ padding: "6px 4px", fontSize: 12, color: "#94a3b8" }}>…</span>
                                        ) : (
                                            <button key={p} onClick={() => setPage(p)}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: page === p ? BLUE : "#fff", color: page === p ? "#fff" : "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                            >
                                                {p}
                                            </button>
                                        ))
                                    }
                                </div>

                                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: page === totalPages ? "#cbd5e1" : "#475569" }}
                                >
                                    Suivant
                                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Historique.layout = page => <DashboardLayout>{page}</DashboardLayout>;