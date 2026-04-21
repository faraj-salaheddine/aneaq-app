// resources/js/Pages/SI/VueEnsemble.jsx

import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const StatCard = ({ label, value, color, bg, icon }) => (
    <div style={{
        background: "#fff",
        border: "1px solid #e8edf3",
        borderRadius: 14,
        padding: "2rem 1.75rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "1.25rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
    }}
        onMouseEnter={e => {
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
            e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
            e.currentTarget.style.transform = "translateY(0)";
        }}
    >
        {/* Icon box */}
        <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: bg, display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0,
        }}>
            {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px", fontWeight: 500 }}>
                {label}
            </p>
            <p style={{ fontSize: 40, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1 }}>
                {value ?? 0}
            </p>
        </div>

        {/* Accent bar */}
        <div style={{
            alignSelf: "stretch",
            width: 4, borderRadius: 99,
            background: color, opacity: 0.4,
        }} />
    </div>
);

const QuickAction = ({ label, href, color, icon }) => (
    <button
        onClick={() => router.visit(href)}
        style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 24px", borderRadius: 10,
            border: `1.5px solid ${color}25`,
            background: `${color}08`,
            color: color, fontSize: 14, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            flex: 1, justifyContent: "center",
        }}
        onMouseEnter={e => {
            e.currentTarget.style.background = color;
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = `${color}08`;
            e.currentTarget.style.color = color;
            e.currentTarget.style.borderColor = `${color}25`;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
        }}
    >
        {icon}
        {label}
    </button>
);

export default function VueEnsemble({ stats = {} }) {
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    return (
        <>
            <Head title="Vue d'ensemble" />
            <div style={{ padding: "2.5rem 3rem", height: "100%", boxSizing: "border-box" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                    <div>
                        <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 6px", textTransform: "capitalize", fontWeight: 500 }}>
                            {today}
                        </p>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                            Vue d'ensemble
                        </h1>
                        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                            Bienvenue sur le tableau de bord du Système d'Information ANEAQ
                        </p>
                    </div>

                    {/* Status badge */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 18px", borderRadius: 99,
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "#22c55e", display: "inline-block",
                            boxShadow: "0 0 0 3px #bbf7d0",
                        }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                            Système opérationnel
                        </span>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div style={{ height: 1, background: "#f1f5f9", marginBottom: "2rem" }} />

                {/* ── Stat Cards ── */}
                <p style={{
                    fontSize: 11, fontWeight: 700, color: "#9ca3af",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    margin: "0 0 1rem",
                }}>
                    Indicateurs clés
                </p>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 20,
                    marginBottom: "2.5rem",
                }}>
                    <StatCard
                        label="Utilisateurs DEE"
                        value={stats.dee}
                        color="#0C447C"
                        bg="#eff6ff"
                        icon={<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#0C447C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    />
                    <StatCard
                        label="Experts"
                        value={stats.experts}
                        color="#1D9E75"
                        bg="#f0fdf4"
                        icon={<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                    />
                    <StatCard
                        label="Établissements"
                        value={stats.etablissements}
                        color="#EF9F27"
                        bg="#fffbeb"
                        icon={<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#EF9F27" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/></svg>}
                    />
                    <StatCard
                        label="Universités"
                        value={stats.universites}
                        color="#378ADD"
                        bg="#eff6ff"
                        icon={<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                    />
                </div>

                {/* ── Quick Actions ── */}
                <div style={{
                    background: "#fff",
                    border: "1px solid #e8edf3",
                    borderRadius: 14,
                    padding: "2rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                        <div style={{ width: 4, height: 20, borderRadius: 99, background: "#0C447C" }} />
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                            Actions rapides
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        <QuickAction
                            label="Ajouter un utilisateur DEE"
                            href="/si/utilisateurs-dee"
                            color="#0C447C"
                            icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                        />
                        <QuickAction
                            label="Ajouter un expert"
                            href="/si/experts"
                            color="#1D9E75"
                            icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                        />
                        <QuickAction
                            label="Voir les établissements"
                            href="/si/etablissements"
                            color="#EF9F27"
                            icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                        />
                        <QuickAction
                            label="Voir les universités"
                            href="/si/universites"
                            color="#378ADD"
                            icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                        />
                    </div>
                </div>

            </div>
        </>
    );
}

VueEnsemble.layout = page => <DashboardLayout>{page}</DashboardLayout>;