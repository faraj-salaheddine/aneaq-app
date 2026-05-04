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
};

export default function EtablissementDashboard({
    etablissement, dossier, onboarding,
    notifications = [], notificationsNonLues = 0,
    taches = [], timeline = []
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

                {/* Statut + Tâches */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.05s" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Statut du dossier</div>
                        {dossier ? (
                            <>
                                <span style={{ fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 99, color: sm.color, background: sm.bg }}>
                                    {sm.label}
                                </span>
                                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, fontFamily: "monospace" }}>Réf. {dossier.reference}</div>
                            </>
                        ) : (
                            <div style={{ fontSize: 13, color: "#94a3b8" }}>Aucun dossier en cours</div>
                        )}
                    </div>

                    <div className="fade-up" style={{ background: taches.length > 0 ? "#fff1f2" : "#f0fdf4", border: `1px solid ${taches.length > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0.08s" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: taches.length > 0 ? "#ef4444" : GREEN, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                            {taches.length > 0 ? `⚠️ ${taches.length} tâche(s) en attente` : "✅ Aucune tâche urgente"}
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
