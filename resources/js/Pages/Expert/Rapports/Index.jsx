import { Head, router } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e03131";

const RAPPORT_META = {
    depose: { label: 'Déposé',  color: ORANGE, bg: '#fffbeb' },
    valide: { label: 'Validé',  color: GREEN,  bg: '#ecfdf5' },
    rejete: { label: 'Rejeté',  color: RED,    bg: '#fef2f2' },
};

function fmtSize(bytes) {
    if (!bytes) return '—';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} Ko` : `${(kb / 1024).toFixed(1)} Mo`;
}

export default function RapportsIndex({ rapports = [], dossiersEnAttente = [] }) {
    return (
        <>
            <Head title="Mes rapports — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .exp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .rap-row { transition: background 0.1s; }
                .rap-row:hover { background: #f8fafc !important; }
                .dl-btn { transition: all 0.15s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; }
                .dl-btn:hover { filter: brightness(0.92); }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div className="exp-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <a href="/expert/dashboard" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textDecoration: "none" }}>Espace Expert</a>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Mes rapports</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${GREEN}30` }}>
                            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Mes rapports</h1>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Dépôt et suivi des rapports finaux d'évaluation</p>
                        </div>
                    </div>
                </div>

                {/* Alert: rapports en attente */}
                {dossiersEnAttente.length > 0 && (
                    <div className="fade-up" style={{ marginBottom: 24, border: `1px solid ${RED}25`, borderRadius: 16, overflow: "hidden", animationDelay: "0.05s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fef2f2", borderBottom: `1px solid ${RED}15` }}>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <p style={{ fontSize: 14, fontWeight: 700, color: RED, margin: 0 }}>
                                {dossiersEnAttente.length} rapport{dossiersEnAttente.length > 1 ? 's' : ''} en attente de dépôt
                            </p>
                        </div>
                        <div style={{ background: "#fff9f9", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {dossiersEnAttente.map(d => (
                                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#fff", border: `1px solid ${RED}15` }}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{d.acronyme} — {d.ville}</p>
                                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Vague {d.vague}</p>
                                    </div>
                                    <button onClick={() => router.visit(route('expert.rapports.create', d.id))}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, background: RED, color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                                        Déposer maintenant
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", animationDelay: "0.1s" }}>
                    <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12, background: "#fafbfc" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Historique des dépôts</h2>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{rapports.length} rapport{rapports.length !== 1 ? 's' : ''} au total</p>
                        </div>
                    </div>

                    {rapports.length === 0 ? (
                        <div style={{ padding: "5rem", textAlign: "center" }}>
                            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 12px" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Aucun rapport déposé pour le moment.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                                <thead>
                                    <tr style={{ background: "#fafbfc", borderBottom: "2px solid #f1f5f9" }}>
                                        {["Établissement", "Vague", "Fichier", "Taille", "Date dépôt", "Statut", ""].map((h, i) => (
                                            <th key={i} style={{ padding: "12px 16px", textAlign: i === 6 ? "right" : "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rapports.map(r => {
                                        const m = RAPPORT_META[r.statut] || { label: r.statut, color: "#64748b", bg: "#f8fafc" };
                                        return (
                                            <tr key={r.id} className="rap-row" style={{ borderTop: "1px solid #f8fafc" }}>
                                                <td style={{ padding: "14px 16px" }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{r.acronyme} — {r.ville}</p>
                                                </td>
                                                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'DM Mono', monospace" }}>{r.vague}</td>
                                                <td style={{ padding: "14px 16px", maxWidth: 220 }}>
                                                    <p style={{ fontSize: 12, color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.original_name}>{r.original_name}</p>
                                                </td>
                                                <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{fmtSize(r.file_size)}</td>
                                                <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                                                <td style={{ padding: "14px 16px" }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: m.bg, color: m.color }}>{m.label}</span>
                                                </td>
                                                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                                    <a href={route('expert.rapports.telecharger', r.id)} className="dl-btn"
                                                        style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 12, fontWeight: 700 }}>
                                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
                                                        Télécharger
                                                    </a>
                                                </td>
                                            </tr>
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

RapportsIndex.layout = page => <ExpertLayout>{page}</ExpertLayout>;
