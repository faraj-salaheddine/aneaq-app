import { Head } from '@inertiajs/react';
import { useState } from 'react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e03131";

const MISSION_STYLE = {
    en_attente_confirmation_expert: { color: ORANGE, bg: "#fffbeb" },
    acces_envoye:                   { color: ORANGE, bg: "#fffbeb" },
    accepte_par_expert:             { color: ORANGE, bg: "#fff7ed" },
    confirme_par_expert:            { color: GREEN,  bg: "#ecfdf5" },
    comite_confirme:                { color: BLUE,   bg: "#eff6ff" },
    refuse_par_expert:              { color: RED,    bg: "#fef2f2" },
    confirme:                       { color: GREEN,  bg: "#ecfdf5" },
    refuse:                         { color: RED,    bg: "#fef2f2" },
};

const RAPPORT_STYLE = {
    brouillon:           { color: "#64748b", bg: "#f8fafc" },
    depose:              { color: ORANGE,    bg: "#fffbeb" },
    transmis_dee:        { color: BLUE,      bg: "#eff6ff" },
    valide_dee:          { color: GREEN,     bg: "#ecfdf5" },
    retourne_correction: { color: RED,       bg: "#fef2f2" },
    valide:              { color: GREEN,     bg: "#ecfdf5" },
    rejete:              { color: RED,       bg: "#fef2f2" },
};

const EVENT_COLOR = {
    invitation_envoyee: BLUE,
    expert_accepte:     GREEN,
    dee_confirme:       "#8b5cf6",
    expert_refuse:      RED,
};

export default function HistoriqueIndex({ participations = [] }) {
    const [expandedId, setExpandedId] = useState(null);

    const total     = participations.length;
    const confirmed = participations.filter(p => p.is_confirmed).length;
    const refused   = participations.filter(p => p.is_refused).length;
    const closed    = participations.filter(p => p.is_closed).length;
    const rapports  = participations.filter(p => p.rapport_id).length;

    const statCards = [
        { label: "Total missions",    value: total,     color: BLUE,      bg: "#EBF4FF", icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
        { label: "Confirmées",        value: confirmed, color: GREEN,     bg: "#ecfdf5", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" },
        { label: "Refusées",          value: refused,   color: RED,       bg: "#fef2f2", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
        { label: "Clôturées",         value: closed,    color: "#64748b", bg: "#f8fafc", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
        { label: "Rapports déposés",  value: rapports,  color: ORANGE,    bg: "#fffbeb", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" },
    ];

    return (
        <>
            <Head title="Historique — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .exp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .h-row { transition: background 0.1s; cursor: pointer; }
                .h-row:hover { background: #f8fafc !important; }
                .tl-panel { overflow: hidden; transition: max-height 0.35s cubic-bezier(.22,1,.36,1), opacity 0.25s; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div className="exp-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <a href="/expert/dashboard" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textDecoration: "none" }}>Espace Expert</a>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Historique</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${BLUE}30` }}>
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Historique des participations</h1>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Toutes vos missions d'évaluation ANEAQ — cliquez une ligne pour voir la chronologie</p>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: "2rem", animationDelay: "0.05s" }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 14, padding: "1.1rem 1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)` }} />
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><path d={s.icon}/></svg>
                            </div>
                            <p style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 3px", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12, background: "#fafbfc" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Toutes les missions</h2>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Total : {total} — cliquez une ligne pour voir la chronologie</p>
                        </div>
                    </div>

                    {total === 0 ? (
                        <div style={{ padding: "5rem", textAlign: "center" }}>
                            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 12px" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Aucune participation enregistrée.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                                <thead>
                                    <tr style={{ background: "#fafbfc", borderBottom: "2px solid #f1f5f9" }}>
                                        {["", "Dossier", "Établissement", "Campagne", "Statut mission", "Date réponse", "Rapport final", "Actions"].map((h, i) => (
                                            <th key={i} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {participations.map(p => {
                                        const rowKey = `${p.assignment_id || p.dossier_id}-${p.dossier_id}`;
                                        const isOpen = expandedId === rowKey;
                                        const ms = MISSION_STYLE[p.status]  || { color: "#64748b", bg: "#f8fafc" };
                                        const rs = RAPPORT_STYLE[p.rapport_statut] || { color: "#64748b", bg: "#f8fafc" };
                                        const timeline = p.timeline || [];
                                        return (
                                            <>
                                                <tr key={rowKey} className="h-row"
                                                    style={{ borderTop: "1px solid #f8fafc", background: isOpen ? "#f0f9ff" : "transparent" }}
                                                    onClick={() => setExpandedId(isOpen ? null : rowKey)}>
                                                    <td style={{ padding: "13px 10px 13px 14px", width: 28 }}>
                                                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "none" }}><polyline points="9 18 15 12 9 6"/></svg>
                                                    </td>
                                                    <td style={{ padding: "13px 14px" }}>
                                                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{p.reference || '—'}</p>
                                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Dossier #{p.dossier_id}</p>
                                                    </td>
                                                    <td style={{ padding: "13px 14px" }}>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{p.etablissement || '—'}</p>
                                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.ville || '—'} · {p.universite || '—'}</p>
                                                    </td>
                                                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.campagne || '—'}</td>
                                                    <td style={{ padding: "13px 14px" }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: ms.bg, color: ms.color, display: "inline-block", marginBottom: 4 }}>{p.status_label || p.status || '—'}</span>
                                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Rôle : {p.role_comite || 'Expert'}</p>
                                                    </td>
                                                    <td style={{ padding: "13px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
                                                        {p.date_reponse || p.date_invitation || '—'}
                                                    </td>
                                                    <td style={{ padding: "13px 14px" }}>
                                                        {p.rapport_id ? (
                                                            <>
                                                                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: rs.bg, color: rs.color, display: "inline-block", marginBottom: 4 }}>{p.rapport_statut_label || p.rapport_statut || '—'}</span>
                                                                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.date_depot_rapport || '—'}</p>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "#f8fafc", color: "#94a3b8" }}>Non déposé</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: "13px 14px" }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                            <a href={`/expert/dossiers/${p.dossier_id}`}
                                                                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                                                Voir
                                                            </a>
                                                            {p.rapport_id && (
                                                                <a href={`/expert/rapports/${p.rapport_id}/telecharger`}
                                                                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: `1px solid ${GREEN}30`, background: `${GREEN}08`, color: GREEN, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                                                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
                                                                    Rapport
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Timeline panel */}
                                                {isOpen && (
                                                    <tr key={`${rowKey}-tl`} style={{ background: "#f0f9ff" }}>
                                                        <td colSpan={8} style={{ padding: "0 14px 18px 42px" }}>
                                                            <div style={{ borderLeft: `2px solid ${BLUE}30`, paddingLeft: 20, paddingTop: 8 }}>
                                                                <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Chronologie de la mission</p>
                                                                {timeline.length === 0 ? (
                                                                    <p style={{ fontSize: 12, color: "#94a3b8" }}>Aucun événement enregistré.</p>
                                                                ) : (
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                                                        {timeline.map((ev, idx) => {
                                                                            const evColor = EVENT_COLOR[ev.event] || "#64748b";
                                                                            const isLast  = idx === timeline.length - 1;
                                                                            return (
                                                                                <div key={idx} style={{ display: "flex", gap: 14, position: "relative" }}>
                                                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                                                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: ev.done ? evColor : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: ev.done ? `0 0 0 3px ${evColor}22` : "none" }}>
                                                                                            {ev.done
                                                                                                ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                                                                : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="12" cy="12" r="4"/></svg>
                                                                                            }
                                                                                        </div>
                                                                                        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: ev.done ? `${evColor}40` : "#e2e8f0", margin: "3px 0" }} />}
                                                                                    </div>
                                                                                    <div style={{ paddingTop: 4, paddingBottom: isLast ? 0 : 18 }}>
                                                                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: ev.done ? "#0f172a" : "#94a3b8" }}>{ev.label}</p>
                                                                                        {ev.done && ev.date ? (
                                                                                            <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 500, color: evColor, fontFamily: "'DM Mono', monospace" }}>{ev.date}</p>
                                                                                        ) : !ev.done ? (
                                                                                            <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>En attente</p>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {p.motif_refus && (
                                                                    <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca" }}>
                                                                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: RED }}>Motif du refus</p>
                                                                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#7f1d1d" }}>{p.motif_refus}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

HistoriqueIndex.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
