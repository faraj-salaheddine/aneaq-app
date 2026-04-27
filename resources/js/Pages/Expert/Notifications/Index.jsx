// resources/js/Pages/Expert/Notifications/Index.jsx
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE = "#0C447C", GREEN = "#1D9E75", ORANGE = "#EF9F27";
const TYPE_META = {
    invitation_participation: { icon: "📬", color: BLUE,   bg: "#EBF4FF" },
    affectation_dossier:      { icon: "📁", color: BLUE,   bg: "#EBF4FF" },
    rappel_evaluation:        { icon: "⚠️", color: ORANGE, bg: "#FFF7ED" },
    rappel_rapport:           { icon: "⏳", color: "#ef4444", bg: "#fff1f2" },
    visite_programmee:        { icon: "📅", color: ORANGE, bg: "#FFF7ED" },
    rapport_valide:           { icon: "✅", color: GREEN,  bg: "#ECFDF5" },
    rapport_rejete:           { icon: "❌", color: "#ef4444", bg: "#fff1f2" },
    general:                  { icon: "🔔", color: "#64748b", bg: "#f1f5f9" },
};

export default function NotificationsIndex({ notifications, nonLues }) {
    const items = notifications?.data ?? [];
    const marquerLu = id => { axios.patch(route("expert.notifications.lire", id)).then(() => router.reload()); };
    const toutLire  = () => { axios.patch(route("expert.notifications.toutLire")).then(() => router.reload()); };

    return (
        <>
            <Head title="Notifications — Expert" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
                .notif-row:hover { background: #f8fafc !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.3s ease both; }
            `}</style>
            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Notifications</h1>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
                            <span style={{ color: "#ef4444", fontWeight: 700 }}>{nonLues}</span> non lue(s)
                        </p>
                    </div>
                    {nonLues > 0 && (
                        <button onClick={toutLire} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${BLUE}25`, background: `${BLUE}08`, color: BLUE, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Tout marquer lu
                        </button>
                    )}
                </div>

                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", animationDelay: "0.05s" }}>
                    {items.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Aucune notification.</div>
                    ) : items.map((n, i) => {
                        const m = TYPE_META[n.type] ?? TYPE_META.general;
                        return (
                            <div key={n.id} className="notif-row"
                                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: i < items.length - 1 ? "1px solid #f8fafc" : "none", background: n.lu ? "#fff" : `${BLUE}03`, transition: "background 0.1s" }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{m.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: n.lu ? 500 : 700, color: "#0f172a", marginBottom: 3 }}>{n.titre}</div>
                                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{n.message}</div>
                                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, fontFamily: "monospace" }}>
                                        {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                                {!n.lu && (
                                    <button onClick={() => marquerLu(n.id)} title="Marquer comme lu"
                                        style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE, border: "none", cursor: "pointer", marginTop: 6, flexShrink: 0 }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {notifications?.last_page > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
                        {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => router.visit(`${route("expert.notifications.index")}?page=${p}`)}
                                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    borderColor: p === notifications.current_page ? BLUE : "#e2e8f0",
                                    background: p === notifications.current_page ? BLUE : "#fff",
                                    color: p === notifications.current_page ? "#fff" : "#64748b",
                                }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
NotificationsIndex.layout = page => <ExpertLayout active="notifications">{page}</ExpertLayout>;