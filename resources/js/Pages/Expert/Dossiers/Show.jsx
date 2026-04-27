// resources/js/Pages/Expert/Dossiers/Show.jsx

import { Head, router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";

const STATUT_META = {
    en_preparation:     { label: "En préparation",    color: "#64748b", bg: "#f1f5f9" },
    autoeval_en_cours:  { label: "Autoéval. en cours",color: "#d97706", bg: "#fffbeb" },
    autoeval_depose:    { label: "Autoéval. déposée", color: "#0891b2", bg: "#ecfeff" },
    en_evaluation:      { label: "En évaluation",     color: BLUE,      bg: "#EBF4FF" },
    visite_planifiee:   { label: "Visite planifiée",  color: ORANGE,    bg: "#FFF7ED" },
    rapport_en_attente: { label: "Rapport attendu",   color: "#ef4444", bg: "#fff1f2" },
    rapport_depose:     { label: "Rapport déposé",    color: GREEN,     bg: "#ECFDF5" },
    valide:             { label: "Validé",            color: GREEN,     bg: "#ECFDF5" },
    cloture:            { label: "Clôturé",           color: "#64748b", bg: "#f1f5f9" },
};

const STEPS = [
    { key: "affecte",    label: "Affectation confirmée",    statuts: ["autoeval_en_cours","autoeval_depose","en_evaluation","visite_planifiee","rapport_en_attente","rapport_depose","valide","cloture"] },
    { key: "autoeval",   label: "Rapport d'autoévaluation", statuts: ["autoeval_depose","en_evaluation","visite_planifiee","rapport_en_attente","rapport_depose","valide","cloture"] },
    { key: "evaluation", label: "Évaluation quantitative",  statuts: ["visite_planifiee","rapport_en_attente","rapport_depose","valide","cloture"], actifs: ["en_evaluation"] },
    { key: "visite",     label: "Visite sur site",          statuts: ["rapport_en_attente","rapport_depose","valide","cloture"], actifs: ["visite_planifiee"] },
    { key: "rapport",    label: "Rapport final déposé",     statuts: ["valide","cloture"], actifs: ["rapport_en_attente","rapport_depose"] },
    { key: "validation", label: "Validation DEE",           statuts: ["cloture"], actifs: ["valide"] },
];

export default function DossierShow({ expert, dossier, comite, progression, rapport, nbRecommandations }) {
    const etab = dossier.etablissement;
    const sm   = STATUT_META[dossier.statut] ?? STATUT_META.en_preparation;

    return (
        <>
            <Head title={`${etab?.acronyme} ${etab?.ville} — Dossier`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .expert-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .action-card { transition: all 0.15s; }
                .action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>

            <div className="expert-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>Espace Expert</span>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <button onClick={() => router.visit(route("expert.dossiers.index"))} style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Dossiers</button>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{etab?.acronyme} {etab?.ville}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${BLUE}, #1a6fbb)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                                {etab?.acronyme?.slice(0, 2)}
                            </div>
                            <div>
                                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a" }}>{etab?.acronyme} — {etab?.ville}</h1>
                                <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>{etab?.universite} · Vague <span style={{ fontFamily: "monospace" }}>{dossier.vague}</span></p>
                            </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 99, color: sm.color, background: sm.bg }}>{sm.label}</span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

                    {/* LEFT */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Infos */}
                        <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", animationDelay: "0.05s" }}>
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>🏛 Informations établissement</div>
                            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                                {[
                                    { l: "Acronyme",  v: etab?.acronyme },
                                    { l: "Ville",     v: etab?.ville },
                                    { l: "Vague",     v: dossier.vague, mono: true },
                                    { l: "Université", v: etab?.universite },
                                    { l: "Domaine",   v: etab?.domaine_connaissances },
                                    { l: "Visite",    v: dossier.date_visite ? new Date(dossier.date_visite).toLocaleDateString("fr-FR") : "Non planifiée", color: dossier.date_visite ? ORANGE : "#94a3b8" },
                                ].map(f => (
                                    <div key={f.l}>
                                        <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{f.l}</div>
                                        <div style={{ fontSize: 13, marginTop: 3, fontWeight: 600, color: f.color ?? "#0f172a", fontFamily: f.mono ? "monospace" : "inherit" }}>{f.v ?? "—"}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progression */}
                        <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", animationDelay: "0.08s" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>📊 Progression évaluation</span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: progression >= 100 ? GREEN : BLUE }}>{progression}%</span>
                            </div>
                            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 4, background: progression >= 100 ? GREEN : `linear-gradient(90deg, ${BLUE}, ${GREEN})`, width: `${progression}%`, transition: "width 1s ease" }} />
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{progression < 100 ? `${progression}% des critères notés` : "✅ Tous les critères évalués"}</div>
                        </div>

                        {/* Comité */}
                        <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", animationDelay: "0.1s" }}>
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                👥 Comité ({comite?.length ?? 0} expert(s))
                            </div>
                            <div style={{ padding: "8px 16px" }}>
                                {comite?.map((m, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < comite.length - 1 ? "1px solid #f8fafc" : "none" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${GREEN}15`, color: GREEN, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            {m.prenom?.[0]}{m.nom?.[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{m.prenom} {m.nom}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.specialite} · {m.grade}</div>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: m.role_comite === "coordonnateur" ? "#FFF7ED" : "#f1f5f9", color: m.role_comite === "coordonnateur" ? ORANGE : "#64748b" }}>
                                            {m.role_comite}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, animationDelay: "0.12s" }}>
                            {[
                                { label: "Évaluation quantitative", sub: `${progression}% complétée`, href: route("expert.evaluation.index", dossier.id), color: BLUE },
                                { label: "Déposer rapport final",   sub: rapport ? `Statut: ${rapport.statut}` : "Non déposé", href: route("expert.rapports.create", dossier.id), color: GREEN },
                                { label: "Matrice recommandations", sub: `${nbRecommandations} ligne(s)`, href: route("expert.matrice.index", dossier.id), color: ORANGE },
                            ].map((a, i) => (
                                <div key={i} className="action-card"
                                    onClick={() => router.visit(a.href)}
                                    style={{ background: "#fff", border: `1px solid ${a.color}20`, borderRadius: 12, padding: "16px", cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: a.color, marginBottom: 4 }}>{a.label}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.sub}</div>
                                    <div style={{ marginTop: 10, fontSize: 11, color: a.color, fontWeight: 600 }}>Accéder →</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT - Timeline */}
                    <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", alignSelf: "start", animationDelay: "0.06s" }}>
                        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>🗺️ Avancement du dossier</div>
                        <div style={{ padding: "16px 20px" }}>
                            {STEPS.map((step, i) => {
                                const done   = step.statuts.includes(dossier.statut);
                                const active = step.actifs?.includes(dossier.statut);
                                return (
                                    <div key={step.key} style={{ display: "flex", gap: 14, paddingBottom: i < STEPS.length - 1 ? 18 : 0 }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 3, background: done ? GREEN : active ? BLUE : "#e2e8f0", boxShadow: active ? `0 0 0 3px ${BLUE}25` : "none" }} />
                                            {i < STEPS.length - 1 && <div style={{ width: 1, flex: 1, background: done ? `${GREEN}40` : "#e2e8f0", margin: "4px 0" }} />}
                                        </div>
                                        <div style={{ paddingBottom: 4 }}>
                                            <div style={{ fontSize: 12.5, fontWeight: 600, color: done ? GREEN : active ? BLUE : "#94a3b8" }}>
                                                {done ? "✔ " : active ? "⚡ " : ""}{step.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

DossierShow.layout = page => <ExpertLayout active="dossiers">{page}</ExpertLayout>;