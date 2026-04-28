// resources/js/Pages/Expert/Profil/Show.jsx

import { Head, router } from "@inertiajs/react";
import ExpertLayout from "@/Layouts/Expert/ExpertLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const PURPLE = "#7e22ce";

const PALETTE = [
    { bg: "#EBF4FF", color: "#1d4ed8" },
    { bg: "#ECFDF5", color: "#065f46" },
    { bg: "#FFF7ED", color: "#9a3412" },
    { bg: "#FAF5FF", color: "#6b21a8" },
];
const getColor = str => PALETTE[(str?.charCodeAt(0) || 0) % PALETTE.length];

function InfoRow({ label, value, mono }) {
    if (!value) return null;
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0, minWidth: 160 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, textAlign: "right", fontFamily: mono ? "'DM Mono', monospace" : "inherit", wordBreak: "break-all" }}>{value}</span>
        </div>
    );
}

function Section({ title, subtitle, color, icon, children }) {
    return (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">{icon}</svg>
                </div>
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
                    {subtitle && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

export default function ProfilShow({ expert, documents = {} }) {
    const av = getColor(expert?.nom ?? "");
    const initiales = ((expert?.prenom?.[0] ?? "") + (expert?.nom?.[0] ?? "")).toUpperCase();
    const formatDate = d => d ? new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : null;
    const formatSize = s => s ? (s < 1024 * 1024 ? `${(s / 1024).toFixed(1)} Ko` : `${(s / 1024 / 1024).toFixed(1)} Mo`) : null;

    const TYPE_META = {
        cin:         { label: "Carte d'identité nationale", color: BLUE,   bg: "#EBF4FF" },
        contract:    { label: "Contrat",                    color: GREEN,  bg: "#ECFDF5" },
        carte_grise: { label: "Carte grise",                color: ORANGE, bg: "#FFFBEB" },
        rib:         { label: "RIB Bancaire",               color: BLUE,   bg: "#EBF4FF" },
    };

    return (
        <>
            <Head title="Mon profil" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
                .doc-card { transition: all 0.2s; }
                .doc-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.25s ease both; }
            `}</style>

            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh", background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)" }}>

                {/* Hero card */}
                <div className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.75rem", marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: `linear-gradient(135deg, ${GREEN}08, ${BLUE}06)`, borderRadius: "0 18px 0 100%", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, position: "relative" }}>
                        {/* Avatar */}
                        <div style={{ width: 68, height: 68, borderRadius: 16, background: av.bg, color: av.color, fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${av.color}20` }}>
                            {initiales}
                        </div>
                        {/* Infos */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                                    {expert?.prenom} <span style={{ fontWeight: 500, color: "#64748b" }}>{expert?.nom}</span>
                                </h1>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${GREEN}12`, color: GREEN }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                                    Expert Évaluateur
                                </span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                                {expert?.email && (
                                    <a href={`mailto:${expert.email}`} style={{ fontSize: 12, color: BLUE, textDecoration: "none", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                        {expert.email}
                                    </a>
                                )}
                                {expert?.telephone && (
                                    <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                        {expert.telephone}
                                    </span>
                                )}
                                {expert?.ville && (
                                    <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        {expert.ville}
                                    </span>
                                )}
                                {expert?.grade && (
                                    <span style={{ fontSize: 12, color: "#64748b" }}>{expert.grade}</span>
                                )}
                            </div>
                        </div>
                        {/* Bouton modifier */}
                        <button
                            onClick={() => router.visit(route("expert.profil.edit"))}
                            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, border: `1px solid ${BLUE}20`, background: `${BLUE}08`, color: BLUE, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${BLUE}08`; e.currentTarget.style.color = BLUE; }}>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Modifier mon profil
                        </button>
                    </div>
                </div>

                {/* Grid 2 colonnes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                    {/* Colonne gauche */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Profil académique */}
                        <div className="fade-up" style={{ animationDelay: "0.05s" }}>
                            <Section title="Profil académique" subtitle="Informations professionnelles" color={PURPLE}
                                icon={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>}>
                                <InfoRow label="Grade"              value={expert?.grade} />
                                <InfoRow label="Fonction actuelle"  value={expert?.fonction_actuelle} />
                                <InfoRow label="Spécialité"         value={expert?.specialite} />
                                <InfoRow label="Établissement"      value={expert?.etablissement} />
                                <InfoRow label="Type établissement" value={expert?.type_etablissement} />
                                <InfoRow label="Université"         value={expert?.universite_ou_departement_ministeriel} />
                                <InfoRow label="Diplômes"           value={expert?.diplomes_obtenus} />
                                <InfoRow label="Date recrutement"   value={formatDate(expert?.date_recrutement)} />
                                <InfoRow label="Responsabilité"     value={expert?.responsabilite} />
                                {!expert?.grade && !expert?.specialite && (
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucune information académique renseignée</p>
                                )}
                            </Section>
                        </div>

                        {/* Informations personnelles */}
                        <div className="fade-up" style={{ animationDelay: "0.08s" }}>
                            <Section title="Informations personnelles" subtitle="Données d'identité" color={BLUE}
                                icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}>
                                <InfoRow label="Date de naissance" value={formatDate(expert?.date_naissance)} />
                                <InfoRow label="Ville"             value={expert?.ville} />
                                <InfoRow label="Pays"              value={expert?.pays} />
                                <InfoRow label="Numéro CIN"        value={expert?.cin_number} mono />
                                {expert?.rib && (
                                    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: `${BLUE}06`, border: `1px solid ${BLUE}15` }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 5px" }}>RIB Bancaire</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: 0, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", wordBreak: "break-all" }}>
                                            {expert.rib}
                                        </p>
                                        <button onClick={() => navigator.clipboard.writeText(expert.rib)}
                                            style={{ marginTop: 6, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4 }}
                                            onMouseEnter={e => e.currentTarget.style.color = BLUE}
                                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                            Copier le RIB
                                        </button>
                                    </div>
                                )}
                            </Section>
                        </div>
                    </div>

                    {/* Colonne droite */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Contrat */}
                        <div className="fade-up" style={{ animationDelay: "0.06s" }}>
                            <Section title="Informations contractuelles" subtitle="Détails du contrat" color={GREEN}
                                icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}>
                                <InfoRow label="Début contrat"    value={formatDate(expert?.contract_start)} />
                                <InfoRow label="Fin contrat"      value={formatDate(expert?.contract_end)} />
                                <InfoRow label="Renouvellements" value={expert?.contract_renewals != null ? `${expert.contract_renewals}x` : null} />
                                {expert?.contract_start && expert?.contract_end && (
                                    <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: `${GREEN}08`, border: `1px solid ${GREEN}20` }}>
                                        <p style={{ fontSize: 11, color: GREEN, fontWeight: 700, margin: "0 0 3px" }}>Durée du contrat</p>
                                        <p style={{ fontSize: 13, color: "#374151", fontWeight: 600, margin: 0 }}>
                                            {Math.round((new Date(expert.contract_end) - new Date(expert.contract_start)) / (1000 * 60 * 60 * 24 * 30))} mois
                                        </p>
                                    </div>
                                )}
                                {!expert?.contract_start && (
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucun contrat renseigné</p>
                                )}
                            </Section>
                        </div>

                        {/* Véhicule */}
                        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
                            <Section title="Véhicule" subtitle="Informations carte grise" color="#c2410c"
                                icon={<><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}>
                                <InfoRow label="Puissance fiscale" value={expert?.car_horsepower ? `${expert.car_horsepower} CV` : null} mono />
                                {!expert?.car_horsepower && (
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucune information véhicule renseignée</p>
                                )}
                            </Section>
                        </div>

                        {/* Documents */}
                        <div className="fade-up" style={{ animationDelay: "0.12s" }}>
                            <Section title="Mes documents" subtitle={`${Object.keys(documents).length} document(s)`} color={ORANGE}
                                icon={<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>}>
                                {Object.keys(documents).length === 0 ? (
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", margin: 0, padding: "8px 0" }}>Aucun document disponible</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {Object.entries(documents).map(([type, docs]) =>
                                            docs.map(doc => {
                                                const meta = TYPE_META[type] ?? { label: type, color: BLUE, bg: "#EBF4FF" };
                                                return (
                                                    <div key={doc.id} className="doc-card"
                                                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 10, border: `1px solid ${meta.color}15`, background: meta.bg }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>{meta.label}</p>
                                                            <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{doc.original_name} · {formatSize(doc.file_size)}</p>
                                                        </div>
                                                        <a href={`/expert/documents/${doc.id}/telecharger`}
                                                            style={{ fontSize: 11, fontWeight: 600, color: meta.color, textDecoration: "none", padding: "4px 10px", borderRadius: 7, border: `1px solid ${meta.color}25`, background: "#fff" }}>
                                                            ⬇ Télécharger
                                                        </a>
                                                    </div>
                                                );
                                            })
                                        )}
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

ProfilShow.layout = page => <ExpertLayout active="profil">{page}</ExpertLayout>;