// resources/js/Pages/SI/Experts/Show.jsx

import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/SI/DashboardLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const PURPLE = "#7e22ce";
const ORANGE = "#EF9F27";

const TYPE_META = {
    cin:         { label: "Carte d'identité nationale", color: BLUE,   bg: "#EBF4FF", icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></> },
    contract:    { label: "Contrat",                    color: GREEN,  bg: "#ECFDF5", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
    carte_grise: { label: "Carte grise",                color: ORANGE, bg: "#FFFBEB", icon: <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
};

const InfoRow = ({ label, value, mono }) => (
    value ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0, minWidth: 140 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, textAlign: "right", fontFamily: mono ? "'DM Mono', monospace" : "inherit", wordBreak: "break-all" }}>{value}</span>
        </div>
    ) : null
);

const Section = ({ title, subtitle, color, icon, children }) => (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">{icon}</svg>
            </div>
            <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

const initials = (nom, prenom) => `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase();

const PALETTE = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
];
const getColor = str => PALETTE[(str?.charCodeAt(0) || 0) % PALETTE.length];

export default function Show({ expert, documents = {} }) {
    const av = getColor(expert.nom);

    const formatDate = d => d ? new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : null;
    const formatSize = s => s ? `${(s / 1024).toFixed(1)} KB` : null;

    return (
        <>
            <Head title={`${expert.nom} ${expert.prenom} — Expert`} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
                .show-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .doc-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
                .doc-card { transition: all 0.2s; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.25s ease both; }
            `}</style>

            <div className="show-root" style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* ── Breadcrumb ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                    <button onClick={() => router.visit("/si/experts")}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12, fontWeight: 500, padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = GREEN}
                        onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                    >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                        Experts
                    </button>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{expert.nom} {expert.prenom}</span>
                </div>

                {/* ── Hero card ── */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                    {/* Background decoration */}
                    <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `linear-gradient(135deg, ${GREEN}08, ${BLUE}06)`, borderRadius: "0 20px 0 100%", pointerEvents: "none" }} />

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative" }}>
                        {/* Avatar */}
                        <div style={{ width: 72, height: 72, borderRadius: 18, background: av.bg, color: av.color, fontWeight: 800, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${av.color}20`, letterSpacing: "0.02em" }}>
                            {initials(expert.nom, expert.prenom)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                                    {expert.nom} <span style={{ fontWeight: 500, color: "#64748b" }}>{expert.prenom}</span>
                                </h1>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${GREEN}12`, color: GREEN }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                                    Expert
                                </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                {expert.email && (
                                    <a href={`mailto:${expert.email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: BLUE, textDecoration: "none", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                        {expert.email}
                                    </a>
                                )}
                                {expert.telephone && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                        {expert.telephone}
                                    </span>
                                )}
                                {expert.ville && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        {expert.ville}
                                    </span>
                                )}
                                {expert.specialite && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                        {expert.specialite}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button
                                onClick={() => router.visit(`/si/experts/${expert.id}/edit`)}
                                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: `1px solid ${BLUE}20`, background: `${BLUE}08`, color: BLUE, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = `${BLUE}08`; e.currentTarget.style.color = BLUE; }}
                            >
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                    {/* ── Left column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Profil académique */}
                        <div className="fade-up" style={{ animationDelay: "0.05s" }}>
                            <Section title="Profil académique" subtitle="Informations professionnelles" color={PURPLE}
                                icon={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}
                            >
                                <InfoRow label="Grade"              value={expert.grade} />
                                <InfoRow label="Fonction actuelle"  value={expert.fonction_actuelle} />
                                <InfoRow label="Spécialité"         value={expert.specialite} />
                                <InfoRow label="Établissement"      value={expert.etablissement} />
                                <InfoRow label="Type établissement" value={expert.type_etablissement} />
                                <InfoRow label="Université / Dép."  value={expert.universite_ou_departement_ministeriel} />
                                <InfoRow label="Diplômes"           value={expert.diplomes_obtenus} />
                                <InfoRow label="Responsabilité"     value={expert.responsabilite} />
                                <InfoRow label="Date recrutement"   value={formatDate(expert.date_recrutement)} />
                                {!expert.grade && !expert.fonction_actuelle && !expert.specialite && (
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucune information académique renseignée</p>
                                )}
                            </Section>
                        </div>

                        {/* Informations personnelles */}
                        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
                            <Section title="Informations personnelles" subtitle="Données d'identité" color={BLUE}
                                icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                            >
                                <InfoRow label="Date de naissance" value={formatDate(expert.date_naissance)} />
                                <InfoRow label="Ville"             value={expert.ville} />
                                <InfoRow label="Pays"              value={expert.pays} />
                                <InfoRow label="Numéro CIN"        value={expert.cin_number} mono />
                                {!expert.date_naissance && !expert.ville && !expert.cin_number && (
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucune information personnelle renseignée</p>
                                )}
                            </Section>
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Contrat */}
                        <div className="fade-up" style={{ animationDelay: "0.08s" }}>
                            <Section title="Informations contractuelles" subtitle="Détails du contrat" color={GREEN}
                                icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}
                            >
                                <InfoRow label="Date de début"        value={formatDate(expert.contract_start)} />
                                <InfoRow label="Date de fin"          value={formatDate(expert.contract_end)} />
                                <InfoRow label="Renouvellements"      value={expert.contract_renewals !== null ? `${expert.contract_renewals}x` : null} />
                                {expert.contract_start && expert.contract_end && (
                                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: `${GREEN}08`, border: `1px solid ${GREEN}20` }}>
                                        <p style={{ fontSize: 11, color: GREEN, fontWeight: 700, margin: "0 0 4px" }}>Durée du contrat</p>
                                        <p style={{ fontSize: 13, color: "#374151", fontWeight: 600, margin: 0 }}>
                                            {Math.round((new Date(expert.contract_end) - new Date(expert.contract_start)) / (1000 * 60 * 60 * 24 * 30))} mois
                                        </p>
                                    </div>
                                )}
                                {!expert.contract_start && (
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucun contrat renseigné</p>
                                )}
                            </Section>
                        </div>

                        {/* Véhicule */}
                        <div className="fade-up" style={{ animationDelay: "0.12s" }}>
                            <Section title="Véhicule" subtitle="Informations carte grise" color="#c2410c"
                                icon={<><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
                            >
                                <InfoRow label="Puissance fiscale" value={expert.car_horsepower ? `${expert.car_horsepower} CV` : null} mono />
                                {!expert.car_horsepower && (
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucune information véhicule renseignée</p>
                                )}
                            </Section>
                        </div>

                        {/* Documents */}
                        <div className="fade-up" style={{ animationDelay: "0.15s" }}>
                            <Section title="Documents" subtitle={`${Object.keys(documents).length} document(s) disponible(s)`} color={ORANGE}
                                icon={<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>}
                            >
                                {Object.keys(documents).length === 0 ? (
                                    <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucun document disponible</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {Object.entries(documents).map(([type, docs]) => {
                                            const doc  = docs[0];
                                            const meta = TYPE_META[type] || { label: type, color: BLUE, bg: "#EBF4FF", icon: null };
                                            return (
                                                <div key={type} className="doc-card"
    style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 12, border: `1px solid ${meta.color}15`, background: meta.bg }}
>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2">{meta.icon}</svg>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.label}</p>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>
            {doc.original_name} · {formatSize(doc.file_size)}
        </p>
    </div>
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {/* Preview button */}
        <button
        onClick={() => window.open(`/si/experts/${expert.id}/documents/${doc.id}/preview`, '_blank')}            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8, border: `1px solid ${meta.color}25`, background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, color: meta.color, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = `${meta.color}10`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
        >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Aperçu
        </button>
        {/* Download button */}
        <a
            href={`/si/experts/${expert.id}/documents/${doc.id}/download`}
            download={doc.original_name}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8, border: `1px solid ${meta.color}25`, background: `${meta.color}10`, cursor: "pointer", fontSize: 11, fontWeight: 600, color: meta.color, textDecoration: "none", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = meta.color; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${meta.color}10`; e.currentTarget.style.color = meta.color; }}
        >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Télécharger
        </a>
    </div>
</div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = page => <DashboardLayout>{page}</DashboardLayout>;