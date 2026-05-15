import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e03131";

const AMBER = '#92400e';

const STATUS_STYLE = {
    en_attente_confirmation_expert: { color: ORANGE, bg: "#fffbeb" },
    acces_envoye:                   { color: ORANGE, bg: "#fffbeb" },
    accepte_par_expert:             { color: BLUE,   bg: "#dbeafe" },
    confirme_par_expert:            { color: GREEN,  bg: "#dcfce7" },
    comite_confirme:                { color: BLUE,   bg: "#eff6ff" },
    refuse_par_expert:              { color: RED,    bg: "#fef2f2" },
    confirme:                       { color: GREEN,  bg: "#dcfce7" },
    refuse:                         { color: RED,    bg: "#fef2f2" },
};

export default function ParticipationsIndex({ participations = [], stats = {} }) {
    const [refusal, setRefusal] = useState({ id: null, motif: '' });

    const pending     = participations.filter(p => p.is_pending);
    const waitingDee  = participations.filter(p => p.is_waiting_dee);
    const confirmed   = participations.filter(p => p.is_confirmed);
    const refused     = participations.filter(p => p.is_refused);

    const acceptParticipation = (p) => {
        router.post(`/expert/affectations/${p.assignment_id}/accept`, {}, { preserveScroll: true });
    };

    const openRefusal = (p) => setRefusal({ id: p.assignment_id, motif: '' });

    const submitRefusal = () => {
        if (!refusal.motif.trim()) return;
        router.post(`/expert/affectations/${refusal.id}/refuse`, { motif_refus: refusal.motif }, {
            preserveScroll: true,
            onSuccess: () => setRefusal({ id: null, motif: '' }),
        });
    };

    const statsCards = [
        { label: "Total",              value: stats.total       || 0, color: BLUE,   bg: "#EBF4FF" },
        { label: "Invitations reçues", value: stats.en_attente  || 0, color: ORANGE, bg: "#fffbeb" },
        { label: "Attente DEE",        value: stats.attente_dee || 0, color: BLUE,   bg: "#dbeafe" },
        { label: "Confirmées",         value: stats.confirmees  || 0, color: GREEN,  bg: "#dcfce7" },
        { label: "Refusées",           value: stats.refusees    || 0, color: RED,    bg: "#fef2f2" },
    ];

    return (
        <>
            <Head title="Mes invitations — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .exp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .p-row { transition: background 0.1s; }
                .p-row:hover { background: #f8fafc !important; }
                .btn-sm { transition: all 0.15s ease; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 5px; }
                .btn-sm:hover { filter: brightness(0.9); }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>

            <div className="exp-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <a href="/expert/dashboard" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textDecoration: "none" }}>Espace Expert</a>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Mes invitations</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${ORANGE}40` }}>
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Demandes de participation</h1>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                                <span style={{ fontWeight: 700, color: ORANGE }}>{stats.en_attente || 0}</span> en attente ·{' '}
                                <span style={{ fontWeight: 600 }}>{stats.total || 0}</span> au total
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: "2rem", animationDelay: "0.05s" }}>
                    {statsCards.map((s, i) => (
                        <div key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 14, padding: "1.1rem 1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}40)` }} />
                            <p style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 500 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Pending */}
                    <Section color={ORANGE} iconPath="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"
                        title="Invitations en attente" subtitle="Acceptez ou refusez ces missions" count={pending.length} animDelay="0.08s">
                        {pending.length === 0 ? <EmptyBox text="Aucune invitation en attente." /> : (
                            <TableWrap cols={["Dossier", "Établissement", "Campagne", "Date invitation", "Actions"]}>
                                {pending.map(p => (
                                    <tr key={p.assignment_id} className="p-row" style={{ borderTop: "1px solid #f8fafc" }}>
                                        <td style={{ padding: "13px 14px" }}>
                                            <StatusBadge status={p.status} label={p.status_label} />
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "5px 0 2px" }}>{p.dossier?.reference || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.role_label || 'Expert'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{p.etablissement?.nom || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.etablissement?.ville || '—'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.campagne || '—'}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{p.date_invitation || '—'}</td>
                                        <td style={{ padding: "13px 14px", textAlign: "right" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7 }}>
                                                <button onClick={() => openRefusal(p)} className="btn-sm"
                                                    style={{ padding: "7px 12px", borderRadius: 8, background: "#fef2f2", color: RED, fontSize: 12, fontWeight: 700 }}>
                                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Refuser
                                                </button>
                                                <button onClick={() => acceptParticipation(p)} className="btn-sm"
                                                    style={{ padding: "7px 12px", borderRadius: 8, background: GREEN, color: "#fff", fontSize: 12, fontWeight: 700 }}>
                                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Accepter
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </TableWrap>
                        )}
                    </Section>

                    {/* Waiting DEE confirmation */}
                    <Section color={BLUE} iconPath="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        title="Acceptées — en attente de confirmation DEE" subtitle="Vous avez accepté ces invitations, la DEE doit confirmer votre affectation" count={waitingDee.length} animDelay="0.10s">
                        {waitingDee.length === 0 ? <EmptyBox text="Aucune invitation en attente de confirmation DEE." /> : (
                            <TableWrap cols={["Dossier", "Établissement", "Campagne", "Date acceptation"]}>
                                {waitingDee.map(p => (
                                    <tr key={p.assignment_id} className="p-row" style={{ borderTop: "1px solid #f8fafc" }}>
                                        <td style={{ padding: "13px 14px" }}>
                                            <StatusBadge status={p.status} label={p.status_label} />
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "5px 0 2px" }}>{p.dossier?.reference || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.role_label || 'Expert'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{p.etablissement?.nom || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.etablissement?.ville || '—'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.campagne || '—'}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{p.date_reponse || '—'}</td>
                                    </tr>
                                ))}
                            </TableWrap>
                        )}
                    </Section>

                    {/* Confirmed */}
                    <Section color={GREEN} iconPath="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"
                        title="Affectations confirmées" subtitle="La DEE a confirmé votre affectation à ces dossiers" count={confirmed.length} animDelay="0.12s">
                        {confirmed.length === 0 ? <EmptyBox text="Aucune demande confirmée." /> : (
                            <TableWrap cols={["Dossier", "Établissement", "Campagne", "Date réponse", "Action"]}>
                                {confirmed.map(p => (
                                    <tr key={p.assignment_id} className="p-row" style={{ borderTop: "1px solid #f8fafc" }}>
                                        <td style={{ padding: "13px 14px" }}>
                                            <StatusBadge status={p.status} label={p.status_label} />
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "5px 0 2px" }}>{p.dossier?.reference || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.role_label || 'Expert'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{p.etablissement?.nom || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.etablissement?.ville || '—'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.campagne || '—'}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{p.date_reponse || p.date_invitation || '—'}</td>
                                        <td style={{ padding: "13px 14px", textAlign: "right" }}>
                                            <a href={`/expert/dossiers/${p.dossier?.id}`}
                                                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                                Ouvrir <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </TableWrap>
                        )}
                    </Section>

                    {/* Refused */}
                    <Section color={RED} iconPath="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                        title="Demandes refusées" subtitle="Les missions que vous avez refusées" count={refused.length} animDelay="0.16s">
                        {refused.length === 0 ? <EmptyBox text="Aucune demande refusée." /> : (
                            <TableWrap cols={["Dossier", "Établissement", "Campagne", "Date refus", "Motif"]}>
                                {refused.map(p => (
                                    <tr key={p.assignment_id} className="p-row" style={{ borderTop: "1px solid #f8fafc" }}>
                                        <td style={{ padding: "13px 14px" }}>
                                            <StatusBadge status={p.status} label={p.status_label} />
                                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "5px 0 2px" }}>{p.dossier?.reference || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.role_label || 'Expert'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px" }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{p.etablissement?.nom || '—'}</p>
                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{p.etablissement?.ville || '—'}</p>
                                        </td>
                                        <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{p.campagne || '—'}</td>
                                        <td style={{ padding: "13px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{p.date_reponse || '—'}</td>
                                        <td style={{ padding: "13px 14px" }}>
                                            {p.motif_refus
                                                ? <span style={{ display: "inline-block", maxWidth: 200, padding: "5px 10px", borderRadius: 8, background: "#fef2f2", color: RED, fontSize: 12, fontWeight: 600 }}>{p.motif_refus}</span>
                                                : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </TableWrap>
                        )}
                    </Section>
                </div>
            </div>

            {/* Refusal modal */}
            <RefusalModal refusal={refusal} setRefusal={setRefusal} onSubmit={submitRefusal} />
        </>
    );
}

function Section({ color, iconPath, title, subtitle, count, animDelay, children }) {
    return (
        <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", animationDelay: animDelay }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafbfc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d={iconPath}/></svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>
                    </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: `${color}10`, color }}>
                    {count} résultat{count !== 1 ? 's' : ''}
                </span>
            </div>
            <div style={{ padding: "0.75rem 1rem" }}>{children}</div>
        </div>
    );
}

function TableWrap({ cols, children }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {cols.map((c, i) => (
                            <th key={i} style={{ padding: "10px 14px", textAlign: i === cols.length - 1 ? "right" : "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function StatusBadge({ status, label }) {
    const s = STATUS_STYLE[status] || { color: "#64748b", bg: "#f8fafc" };
    return (
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, display: "inline-block" }}>
            {label || status || '—'}
        </span>
    );
}

function EmptyBox({ text }) {
    return (
        <div style={{ padding: "2.5rem", textAlign: "center", border: "1.5px dashed #e2e8f0", borderRadius: 12 }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 8px" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{text}</p>
        </div>
    );
}

function RefusalModal({ refusal, setRefusal, onSubmit }) {
    if (refusal.id === null) return null;
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Refuser la participation</h3>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Expliquez votre motif de refus</p>
                    </div>
                </div>
                <textarea
                    value={refusal.motif}
                    onChange={e => setRefusal(r => ({ ...r, motif: e.target.value }))}
                    placeholder="Décrivez votre motif de refus (obligatoire)…"
                    rows={4}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }}
                />
                {!refusal.motif.trim() && (
                    <p style={{ fontSize: 11, color: RED, margin: "6px 0 0" }}>Le motif de refus est obligatoire.</p>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                    <button onClick={() => setRefusal({ id: null, motif: '' })}
                        style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>
                        Annuler
                    </button>
                    <button onClick={onSubmit} disabled={!refusal.motif.trim()}
                        style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: RED, color: "#fff", fontSize: 13, fontWeight: 700, cursor: refusal.motif.trim() ? "pointer" : "not-allowed", opacity: refusal.motif.trim() ? 1 : 0.5 }}>
                        Confirmer le refus
                    </button>
                </div>
            </div>
        </div>
    );
}

ParticipationsIndex.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;
