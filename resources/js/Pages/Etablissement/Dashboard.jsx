import { Head, router } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";

const STATUT_META = {
    en_attente_formulaire: { label: "En attente de profil",  color: ORANGE,    bg: "#FFF7ED" },
    formulaire_complete:   { label: "Profil complété",        color: GREEN,     bg: "#ECFDF5" },
    rapport_depose:        { label: "Rapport déposé",         color: BLUE,      bg: "#EFF6FF" },
    visite_planifiee:      { label: "Visite planifiée",       color: "#8B5CF6", bg: "#F5F3FF" },
    rapport_en_attente:    { label: "Rapport expert en cours",color: "#6366F1", bg: "#EEF2FF" },
    valide:                { label: "Validé ✅",              color: GREEN,     bg: "#ECFDF5" },
    rejete:                { label: "Rejeté",                 color: "#ef4444", bg: "#FFF1F2" },
    cloture:               { label: "Clôturé",                color: "#6b7280", bg: "#f3f4f6" },
};

const NOTIF_COLORS = {
    reponse:  { border: '#6EE7B7', bg: '#f0fdf4', icon: '💬', color: '#065F46' },
    document: { border: '#93C5FD', bg: '#eff6ff', icon: '📄', color: '#1e40af' },
    annexe:   { border: '#C4B5FD', bg: '#f5f3ff', icon: '📎', color: '#5b21b6' },
    question: { border: '#FDE68A', bg: '#fefce8', icon: '❓', color: '#92400e' },
    visite:   { border: '#6EE7B7', bg: '#f0f9ff', icon: '📅', color: '#0369a1' },
    info:     { border: '#e2e8f0', bg: '#f8fafc', icon: 'ℹ️',  color: '#475569' },
};

export default function EtablissementDashboard({
    etablissement, dossier, onboarding,
    notifications = [], notificationsNonLues = 0,
    derniereNotif = null,
    taches = [], timeline = [], documentsManquants = [], dossierId = null
}) {
    const nom = etablissement.etablissement_2 || etablissement.etablissement || etablissement.acronyme || "Établissement";
    const sm  = dossier ? (STATUT_META[dossier.statut] ?? { label: dossier.statut, color: "#64748b", bg: "#f1f5f9" }) : null;
    const done = timeline.filter(t => t.done).length;

    return (
        <>
            <Head title="Tableau de bord" />
            <style>{`
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Bienvenue, {nom}</h1>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Tableau de bord de votre espace d'évaluation</p>
                </div>

                {/* Dernière notification urgente */}
                {derniereNotif && (() => {
                    const c = NOTIF_COLORS[derniereNotif.type] ?? NOTIF_COLORS.info;
                    return (
                        <div className="fade-up" style={{ marginBottom: "1.5rem", padding: "14px 18px", borderRadius: 12, background: c.bg, border: `1.5px solid ${c.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 20 }}>{c.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{derniereNotif.titre}</div>
                                <div style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>{derniereNotif.message}</div>
                            </div>
                            <a href="/etablissement/notifications" style={{ fontSize: 11, fontWeight: 600, color: c.color, textDecoration: "none", whiteSpace: "nowrap", opacity: 0.7 }}>Voir tout →</a>
                        </div>
                    );
                })()}

                {/* Accès dossier affecté */}
                {dossier && (
                    <div className="fade-up" style={{ marginBottom: "1.5rem", borderRadius: 18, overflow: "hidden", background: "#fff", border: "1px solid #bfdbfe", boxShadow: "0 10px 28px rgba(12,68,124,.08)", animationDelay: "0.04s" }}>
                        <div style={{ padding: "1.4rem 1.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, background: "linear-gradient(135deg,#eff6ff,#ffffff)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                                <div style={{ width: 46, height: 46, borderRadius: 14, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, flexShrink: 0 }}>
                                    D
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: BLUE, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>Dossier affecté</div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                                        {dossier.reference || "Dossier en cours"}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>
                                        Consultez les informations du dossier, les documents, les annexes, les recommandations et les échanges DEE.
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                {sm && (
                                    <span style={{ fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 99, color: sm.color, background: sm.bg }}>
                                        {sm.label}
                                    </span>
                                )}
                                <button
                                    onClick={() => router.visit("/etablissement/dossier")}
                                    style={{ padding: "10px 18px", border: "none", borderRadius: 11, background: BLUE, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                                    Ouvrir le dossier →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statut + Tâches */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.05s" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Statut du dossier</div>
                        {dossier ? (
                            dossier.est_cloture ? (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                        <span style={{ fontSize: 18 }}>🔒</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>Aucun dossier ouvert</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Votre évaluation est terminée.</div>
                                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dossier archivé</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginTop: 3, fontFamily: "monospace" }}>Réf. {dossier.reference}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 99, color: sm.color, background: sm.bg }}>
                                        {sm.label}
                                    </span>
                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, fontFamily: "monospace" }}>Réf. {dossier.reference}</div>
                                    {dossier.date_visite && (
                                        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#f0f9ff", border: "1.5px solid #bae6fd", display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontSize: 16 }}>📅</span>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em" }}>Date de visite planifiée</div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: "#0c4a6e", marginTop: 1 }}>{dossier.date_visite}</div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            <div style={{ fontSize: 13, color: "#94a3b8" }}>Aucun dossier en cours</div>
                        )}
                    </div>

                    <div className="fade-up" style={{ background: dossier?.est_cloture ? "#f9fafb" : taches.length > 0 ? "#fff1f2" : "#f0fdf4", border: `1px solid ${dossier?.est_cloture ? "#e5e7eb" : taches.length > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.08s" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: dossier?.est_cloture ? "#9ca3af" : taches.length > 0 ? "#ef4444" : GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                            {dossier?.est_cloture ? "✅ Évaluation terminée" : taches.length > 0 ? `⚠️ ${taches.length} tâche(s) en attente` : "✅ Aucune tâche urgente"}
                        </div>
                        {taches.map(t => (
                            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{t.label}</span>
                                <button onClick={() => router.visit(t.lien)}
                                    style={{ marginLeft: 12, padding: "5px 12px", background: "#ef4444", border: "none", borderRadius: 7, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                                    Faire →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                {timeline.length > 0 && (
                    <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem 2rem", marginBottom: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.1s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Progression du dossier</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{done}/{timeline.length} étapes</div>
                        </div>
                        {/* Bar */}
                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, marginBottom: "1.5rem", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(done / timeline.length) * 100}%`, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, borderRadius: 99, transition: "width 0.5s ease" }} />
                        </div>
                        {/* Steps */}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            {timeline.map((step, i) => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${step.done ? GREEN : step.current ? BLUE : "#e2e8f0"}`, background: step.done ? GREEN : step.current ? BLUE : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginBottom: 8 }}>
                                        {step.done
                                            ? <span style={{ color: "#fff", fontSize: 14 }}>✓</span>
                                            : <span style={{ color: step.current ? "#fff" : "#94a3b8" }}>{i + 1}</span>}
                                    </div>
                                    <div style={{ fontSize: 10, textAlign: "center", color: step.done ? GREEN : step.current ? BLUE : "#94a3b8", fontWeight: step.current ? 700 : 400, maxWidth: 70, lineHeight: 1.3 }}>
                                        {step.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents manquants */}
                {documentsManquants.length > 0 && (
                    <div className="fade-up" style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.12s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚠️</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>Documents manquants</div>
                                <div style={{ fontSize: 12, color: "#b45309" }}>{documentsManquants.length} document{documentsManquants.length !== 1 ? 's' : ''} requis non déposé{documentsManquants.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {documentsManquants.map((doc, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid #fed7aa" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{doc.label}</span>
                                    </div>
                                    <button
                                        onClick={() => router.visit("/etablissement/documents")}
                                        style={{ padding: "5px 14px", background: ORANGE, border: "none", borderRadius: 7, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                        Déposer →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommandations quick access */}
                {dossierId && (
                    <div className="fade-up" style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", animationDelay: "0.12s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#7c3aed" }}>Recommandations DEE</div>
                                <div style={{ fontSize: 12, color: "#a855f7" }}>Consultez et répondez aux recommandations de la DEE</div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.visit(`/etablissement/recommandations/${dossierId}`)}
                            style={{ padding: "7px 18px", background: "#7c3aed", border: "none", borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                            Consulter →
                        </button>
                    </div>
                )}

                {/* Q&R quick access */}
                {dossierId && (
                    <div className="fade-up" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", animationDelay: "0.13s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8" }}>Questions & Réponses</div>
                                <div style={{ fontSize: 12, color: "#3b82f6" }}>Posez vos questions à la DEE concernant votre dossier</div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.visit(`/etablissement/questions-reponses/${dossierId}`)}
                            style={{ padding: "7px 18px", background: BLUE, border: "none", borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                            Accéder →
                        </button>
                    </div>
                )}

                {/* Notifications */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.15s" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>🔔 Notifications récentes</span>
                        {notificationsNonLues > 0 && (
                            <span style={{ background: "#ef4444", color: "#fff", borderRadius: 99, fontSize: 10, padding: "2px 7px", fontWeight: 700 }}>
                                {notificationsNonLues}
                            </span>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Aucune notification</div>
                    ) : notifications.map(n => (
                        <div key={n.id} style={{ padding: "12px 1.5rem", borderBottom: "1px solid #f8fafc", display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.lu ? "#e2e8f0" : "#ef4444", marginTop: 5, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{n.titre}</div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{n.message}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>
                                    {new Date(n.created_at).toLocaleDateString("fr-FR")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>


        </>
    );
}

EtablissementDashboard.layout = page => <EtablissementLayout active="dashboard">{page}</EtablissementLayout>;
