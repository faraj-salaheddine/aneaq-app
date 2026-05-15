import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const RED    = "#e03131";

const TYPE_META = {
    invitation_participation: { color: BLUE,   bg: "#EBF4FF", label: 'Invitation',      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
    affectation_dossier:      { color: BLUE,   bg: "#EBF4FF", label: 'Affectation',     icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" },
    rappel_evaluation:        { color: ORANGE, bg: "#fffbeb", label: 'Rappel éval.',    icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
    rappel_rapport:           { color: RED,    bg: "#fef2f2", label: 'Rappel rapport',  icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" },
    visite_programmee:        { color: ORANGE, bg: "#fff7ed", label: 'Visite',          icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
    rapport_valide:           { color: GREEN,  bg: "#ecfdf5", label: 'Rapport validé',  icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" },
    rapport_rejete:           { color: RED,    bg: "#fef2f2", label: 'Rapport rejeté',  icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
    general:                  { color: "#64748b", bg: "#f8fafc", label: 'Général',      icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
};

export default function NotificationsIndex({ notifications, nonLues }) {
    const [loading, setLoading] = useState(false);
    const items = notifications?.data ?? [];

    const marquerLu = (id) => {
        axios.patch(route('expert.notifications.lire', id)).then(() => router.reload({ only: ['notifications', 'nonLues'] }));
    };

    const toutLire = () => {
        setLoading(true);
        axios.patch(route('expert.notifications.toutLire')).then(() => {
            setLoading(false);
            router.reload({ only: ['notifications', 'nonLues'] });
        });
    };

    return (
        <>
            <Head title="Notifications — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .exp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .notif-row { transition: background 0.1s; }
                .notif-row:hover { background: #f8fafc !important; }
                .mark-btn { transition: all 0.15s ease; cursor: pointer; border: none; }
                .mark-btn:hover { filter: brightness(0.88); }
                .read-all-btn { transition: all 0.15s ease; cursor: pointer; }
                .read-all-btn:hover { filter: brightness(0.92); }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div className="exp-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                            <a href="/expert/dashboard" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, textDecoration: "none" }}>Espace Expert</a>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Notifications</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ position: "relative", width: 48, height: 48, borderRadius: 14, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${BLUE}30` }}>
                                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                {nonLues > 0 && (
                                    <span style={{ position: "absolute", top: -5, right: -5, minWidth: 20, height: 20, borderRadius: 10, background: "#ef4444", fontSize: 10, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                                        {nonLues > 9 ? "9+" : nonLues}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Notifications</h1>
                                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                                    <span style={{ fontWeight: 700, color: RED }}>{nonLues}</span> non lue{nonLues !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {nonLues > 0 && (
                        <button onClick={toutLire} disabled={loading} className="read-all-btn"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: `1px solid ${BLUE}25`, background: "#fff", color: BLUE, fontSize: 13, fontWeight: 700, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", opacity: loading ? 0.6 : 1 }}>
                            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/><polyline points="13 17 7 11"/></svg>
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                {/* Notifications list */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", animationDelay: "0.08s" }}>
                    {items.length === 0 ? (
                        <div style={{ padding: "5rem", textAlign: "center" }}>
                            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 12px" }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                            <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Aucune notification pour le moment.</p>
                        </div>
                    ) : (
                        <div>
                            {items.map((n, idx) => {
                                const meta = TYPE_META[n.type] ?? TYPE_META.general;
                                return (
                                    <div key={n.id} className="notif-row"
                                        style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: idx < items.length - 1 ? "1px solid #f8fafc" : "none", background: n.lu ? "transparent" : `${BLUE}04` }}>

                                        {/* Icon */}
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${meta.color}18` }}>
                                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2"><path d={meta.icon}/></svg>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: meta.color }}>{meta.label}</span>
                                                        {!n.lu && <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />}
                                                    </div>
                                                    <p style={{ fontSize: 14, fontWeight: n.lu ? 600 : 700, color: "#0f172a", margin: "0 0 4px" }}>{n.titre}</p>
                                                    {n.message && <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 6px", lineHeight: 1.6 }}>{n.message}</p>}
                                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontFamily: "'DM Mono', monospace" }}>
                                                        {new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>

                                                {!n.lu && (
                                                    <button onClick={() => marquerLu(n.id)} className="mark-btn" title="Marquer comme lu"
                                                        style={{ width: 28, height: 28, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {notifications?.last_page > 1 && (
                    <div className="fade-up" style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animationDelay: "0.15s" }}>
                        {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map(p => (
                            <button key={p}
                                onClick={() => router.visit(`${route('expert.notifications.index')}?page=${p}`)}
                                style={{ width: 36, height: 36, borderRadius: 9, border: p === notifications.current_page ? `1px solid ${BLUE}` : "1px solid #e2e8f0", background: p === notifications.current_page ? BLUE : "#fff", color: p === notifications.current_page ? "#fff" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

NotificationsIndex.layout = page => <ExpertLayout>{page}</ExpertLayout>;
