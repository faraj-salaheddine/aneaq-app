import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const BLUE   = "#0C447C";
const GREEN  = "#1D9E75";
const ORANGE = "#EF9F27";
const PURPLE = "#7c3aed";
const RED    = "#dc2626";

const DOC_TYPE_LABELS = {
    rapport_autoevaluation:         { label: "Rapport d'autoévaluation",  color: BLUE     },
    document_complementaire:        { label: "Document complémentaire",    color: ORANGE   },
    annexe:                         { label: "Annexe",                     color: PURPLE   },
    rapport_aneaq:                  { label: "Rapport ANEAQ",              color: GREEN    },
    complement:                     { label: "Document complémentaire",    color: ORANGE   },
    lettre:                         { label: "Lettre",                     color: "#0ea5e9"},
    contrat:                        { label: "Contrat",                    color: "#64748b"},
    document:                       { label: "Pièce jointe",               color: "#64748b"},
};

const DOC_STATUS_META = {
    depose:           { label: "Déposé",         color: "#64748b", bg: "#f1f5f9" },
    Depose:           { label: "Déposé",         color: "#64748b", bg: "#f1f5f9" },
    "Déposé":         { label: "Déposé",         color: "#64748b", bg: "#f1f5f9" },
    valide:           { label: "Validé",         color: GREEN,     bg: "#ecfdf5" },
    valide_par_dee:   { label: "Validé DEE",     color: GREEN,     bg: "#ecfdf5" },
    rejete_par_dee:   { label: "À corriger",     color: RED,       bg: "#fef2f2" },
    en_attente:       { label: "En attente",     color: ORANGE,    bg: "#fff7ed" },
    accepte:          { label: "Accepté",        color: GREEN,     bg: "#ecfdf5" },
};

const STATUS_META = {
    en_attente_formulaire: { label: "En attente de profil",    color: ORANGE },
    formulaire_complete:   { label: "Profil complété",         color: GREEN  },
    rapport_depose:        { label: "Rapport déposé",          color: BLUE   },
    visite_planifiee:      { label: "Visite planifiée",        color: PURPLE },
    visite_confirmee:      { label: "Visite confirmée ✓",      color: GREEN  },
    valide:                { label: "Validé",                  color: GREEN  },
    rejete:                { label: "Rejeté",                  color: RED    },
};

export default function EtablissementDossierShow({
    etablissement = {},
    dossier = {},
    timeline = [],
    documentsStats = {},
    allDocuments = [],
    visiteConfirmation = null,
}) {
    const status = STATUS_META[dossier.statut] || { label: dossier.statut || "En cours", color: "#64748b" };
    const done = timeline.filter(s => s.done).length;
    const progress = timeline.length ? Math.round((done / timeline.length) * 100) : 0;

    const rapportDocs   = allDocuments.filter(d => d.type === 'rapport_autoevaluation');
    const autresDocs    = allDocuments.filter(d => d.type !== 'rapport_autoevaluation');
    const rapportStatus = documentsStats.rapport_status || 'aucun';

    const actions = [
        { title: "Profil établissement",      desc: "Consulter et mettre à jour les informations.",       href: "/etablissement/profil",                              color: BLUE   },
        { title: "Rapport d'autoévaluation",  desc: "Déposer ou consulter le rapport transmis à la DEE.", href: "/etablissement/documents",                           color: GREEN  },
        { title: "Annexes",                   desc: "Ajouter les preuves et les pièces annexes.",         href: "/etablissement/annexes",                             color: ORANGE },
        { title: "Documents complémentaires", desc: "Ajouter les documents demandés en complément.",      href: "/etablissement/documents-complementaires",           color: "#0ea5e9" },
        { title: "Questions & Réponses",      desc: "Échanger avec la DEE sur ce dossier.",               href: `/etablissement/questions-reponses/${dossier.id}`,   color: BLUE   },
        { title: "Recommandations DEE",       desc: "Suivre les recommandations envoyées par la DEE.",    href: `/etablissement/recommandations/${dossier.id}`,      color: PURPLE },
    ];

    return (
        <>
            <Head title={`Dossier ${dossier.reference || ""}`} />
            <style>{`
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp .35s ease both; }
                .card-hover { transition: transform .15s ease, box-shadow .15s ease; }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(12,68,124,.12) !important; }
            `}</style>

            <div style={{ padding: "2.5rem 3rem", minHeight: "100vh" }}>

                {/* Header */}
                <div className="fade-up" style={{ marginBottom: "1.75rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div>
                        <button onClick={() => router.visit("/etablissement/dashboard")}
                            style={{ border: "none", background: "transparent", padding: 0, color: "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                            ← Retour au tableau de bord
                        </button>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Dossier affecté</h1>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "5px 0 0" }}>Vue centrale du dossier attribué à votre établissement.</p>
                    </div>
                    <button onClick={() => router.visit("/etablissement/documents")}
                        style={{ padding: "10px 18px", borderRadius: 11, border: "none", background: BLUE, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                        Déposer un document
                    </button>
                </div>

                {/* Hero */}
                <section className="fade-up" style={{ borderRadius: 22, overflow: "hidden", marginBottom: "1.5rem", boxShadow: "0 18px 45px rgba(12,68,124,.18)", animationDelay: ".04s" }}>
                    <div style={{ background: `linear-gradient(135deg, ${BLUE}, #1d6dc5)`, padding: "2rem", color: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em", opacity: .7, marginBottom: 8 }}>Référence dossier</div>
                                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-.03em" }}>{dossier.reference || "Dossier"}</h2>
                                <p style={{ margin: "8px 0 0", fontSize: 14, opacity: .78, fontWeight: 600 }}>
                                    {etablissement.nom || "Établissement"}{etablissement.ville ? ` · ${etablissement.ville}` : ""}
                                </p>
                            </div>
                            <span style={{ padding: "7px 14px", borderRadius: 99, background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 900, border: "1px solid rgba(255,255,255,0.3)" }}>
                                {status.label}
                            </span>
                        </div>
                    </div>
                    <div style={{ background: "#fff", padding: "1rem 2rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                        <InfoPill label="Campagne"    value={dossier.campagne || "—"} />
                        <InfoPill label="Date visite" value={dossier.date_visite || "Non planifiée"} />
                        <InfoPill label="Documents"   value={`${documentsStats.total || 0} déposé(s)`} />
                        <InfoPill label="Progression" value={`${progress}%`} color={progress === 100 ? GREEN : progress >= 60 ? BLUE : ORANGE} />
                    </div>
                </section>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" }}>

                    {/* Left column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                        {/* Progression */}
                        <Card title="Progression du dossier" delay=".08s">
                            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: "1.4rem" }}>
                                <div style={{ width: `${progress}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`, transition: "width 0.6s ease" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(timeline.length, 1)},1fr)`, gap: 10, marginBottom: "1.2rem" }}>
                                {timeline.map((step, i) => (
                                    <div key={step.statut || i} style={{ textAlign: "center" }}>
                                        <div style={{ width: 34, height: 34, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${step.done ? GREEN : step.current ? BLUE : "#e2e8f0"}`, background: step.done ? GREEN : step.current ? BLUE : "#fff", color: step.done || step.current ? "#fff" : "#94a3b8", fontWeight: 900, fontSize: 12 }}>
                                            {step.done && !step.current ? "✓" : i + 1}
                                        </div>
                                        <div style={{ fontSize: 11, color: step.done ? GREEN : step.current ? BLUE : "#94a3b8", fontWeight: step.current || step.done ? 800 : 600, lineHeight: 1.35 }}>
                                            {step.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA pour l'étape courante */}
                            {(() => {
                                const currentStep = timeline.find(s => s.current);
                                if (!currentStep) return null;
                                const isLast = currentStep.statut === 'valide';
                                const accent = isLast ? GREEN : BLUE;
                                return (
                                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: `${accent}0d`, border: `1.5px solid ${accent}30` }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5">
                                                {currentStep.href
                                                    ? <><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></>
                                                    : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                                                }
                                            </svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: accent, marginBottom: 2 }}>
                                                Étape en cours — {currentStep.label}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, lineHeight: 1.4 }}>
                                                {currentStep.desc}
                                            </div>
                                        </div>
                                        {currentStep.href && currentStep.cta && (
                                            <button
                                                onClick={() => router.visit(currentStep.href)}
                                                style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${accent}`, background: accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                                            >
                                                {currentStep.cta} →
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}
                        </Card>

                        {/* Widget confirmation date de visite */}
                        {visiteConfirmation?.date_visite && (
                            <VisiteConfirmationWidget
                                confirmation={visiteConfirmation}
                                postUrl="/etablissement/visite/repondre"
                            />
                        )}

                        {/* Rapport d'autoévaluation */}
                        {(() => {
                            const anyRejete = rapportDocs.some(d => d.status === 'rejete_par_dee');
                            return (
                                <Card title="Rapport d'autoévaluation" delay=".1s">
                                    {rapportDocs.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                                            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                                            <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, margin: 0 }}>Aucun rapport déposé pour le moment.</p>
                                            <button onClick={() => router.visit("/etablissement/documents")}
                                                style={{ marginTop: 12, padding: "8px 18px", borderRadius: 9, border: `1px solid ${GREEN}`, background: `${GREEN}10`, color: GREEN, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                Déposer le rapport
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                                {rapportDocs.map(doc => (
                                                    <DocCard key={doc.id} doc={doc} />
                                                ))}
                                            </div>
                                            {anyRejete && (
                                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #fecaca" }}>
                                                    <button onClick={() => router.visit("/etablissement/documents")}
                                                        style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1.5px solid #dc2626", background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                        Corriger et redéposer le rapport
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Card>
                            );
                        })()}

                        {/* Autres documents */}
                        {autresDocs.length > 0 && (
                            <Card title={`Autres documents (${autresDocs.length})`} delay=".12s">
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {autresDocs.map(doc => (
                                        <DocCard key={doc.id} doc={doc} />
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Informations du dossier */}
                        <Card title="Informations du dossier" delay=".16s">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <InfoBox label="Établissement" value={etablissement.nom} />
                                <InfoBox label="Acronyme"      value={etablissement.acronyme} />
                                <InfoBox label="Université"    value={etablissement.universite} />
                                <InfoBox label="Email"         value={etablissement.email} />
                                <InfoBox label="Créé le"       value={dossier.created_at} />
                                <InfoBox label="Mise à jour"   value={dossier.updated_at} />
                            </div>
                            {dossier.observation && (
                                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "#fff7ed", border: "1px solid #fed7aa", color: "#92400e", fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
                                    {dossier.observation}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right column */}
                    <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                        {/* Rapport status card */}
                        <section className="fade-up" style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.06)", animationDelay: ".1s" }}>
                            <RapportStatusCard status={rapportStatus} />
                        </section>

                        {/* Navigation actions */}
                        <section className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.04)", animationDelay: ".12s" }}>
                            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Navigation rapide</h3>
                            </div>
                            <div style={{ padding: "0.5rem" }}>
                                {actions.map((action, i) => (
                                    <button key={action.title}
                                        onClick={() => router.visit(action.href)}
                                        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", border: "none", background: "transparent", borderRadius: 11, padding: "10px 12px", cursor: "pointer", transition: "background 0.15s", borderBottom: i < actions.length - 1 ? "1px solid #f8fafc" : "none" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${action.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={action.color} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: action.color }}>{action.title}</div>
                                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{action.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
}

function VisiteConfirmationWidget({ confirmation, postUrl }) {
    const [showRefuse, setShowRefuse] = useState(false);
    const { data, setData, post, processing } = useForm({ statut: 'refuse', message: '' });

    const statut    = confirmation?.statut;
    const date      = confirmation?.date_visite;
    const motif     = confirmation?.message;

    const handleRefuse = (e) => {
        e.preventDefault();
        post(postUrl, { preserveScroll: true });
    };

    if (statut === 'accepte') {
        return (
            <Card title="Date de visite" delay=".09s">
                <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                    <div style={{ fontWeight: 800, color: GREEN, fontSize: 15 }}>Visite acceptée</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        Vous avez accepté la date du <strong>{date}</strong>.
                    </div>
                </div>
            </Card>
        );
    }

    if (statut === 'refuse') {
        return (
            <Card title="Date de visite annulée" delay=".09s">
                <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>❌</div>
                    <div style={{ fontWeight: 800, color: RED, fontSize: 15 }}>Vous avez refusé</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        La date du <strong>{date}</strong> a été annulée. La DEE a été notifiée.
                    </div>
                    {motif && (
                        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', fontSize: 12, color: '#7f1d1d', textAlign: 'left' }}>
                            Motif : {motif}
                        </div>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <Card title="Confirmation requise — Date de visite" delay=".09s">
            <div style={{ padding: '0.25rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: '#fff7ed', border: '1.5px solid #fde68a', marginBottom: 14 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>📅</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>Date de visite planifiée</div>
                        <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                            La DEE a fixé la visite au <strong>{date}</strong>
                        </div>
                    </div>
                </div>

                {!showRefuse ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            onClick={() => router.post(postUrl, { statut: 'accepte', message: '' }, { preserveScroll: true })}
                            style={{ padding: '10px', borderRadius: 11, border: 'none', background: GREEN, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                            ✓ Accepter
                        </button>
                        <button
                            onClick={() => setShowRefuse(true)}
                            style={{ padding: '10px', borderRadius: 11, border: `1.5px solid ${RED}`, background: '#fff', color: RED, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                            ✕ Refuser
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleRefuse}>
                        <div style={{ marginBottom: 8, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                            Motif du refus (optionnel) :
                        </div>
                        <textarea
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            rows={3}
                            placeholder="Expliquez pourquoi vous refusez cette date..."
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'vertical', marginBottom: 10, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ padding: '10px', borderRadius: 11, border: 'none', background: RED, color: '#fff', fontSize: 13, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}
                            >
                                Confirmer le refus
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRefuse(false)}
                                style={{ padding: '10px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Card>
    );
}

function DocCard({ doc }) {
    const typeMeta   = DOC_TYPE_LABELS[doc.type] || { label: doc.type ? doc.type.replace(/_/g, ' ') : "Pièce jointe", color: "#64748b" };
    const statusMeta = DOC_STATUS_META[doc.status] || { label: doc.status || "Déposé", color: "#64748b", bg: "#f1f5f9" };
    const isRejete   = doc.status === 'rejete_par_dee';

    return (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: isRejete ? "#fff8f8" : "#f8fafc", border: `1px solid ${isRejete ? '#fca5a5' : '#eef2f7'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.nom}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${typeMeta.color}15`, color: typeMeta.color }}>
                            {typeMeta.label}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: statusMeta.bg, color: statusMeta.color }}>
                            {statusMeta.label}
                        </span>
                        {doc.size && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{doc.size}</span>}
                    </div>
                </div>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{doc.date}</span>
            </div>
        </div>
    );
}

function RapportStatusCard({ status }) {
    const meta = {
        aucun:          { title: "Aucun rapport",          desc: "Déposez votre rapport d'autoévaluation.",  color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", icon: "📂", btn: { label: "Déposer le rapport", color: BLUE } },
        depose:         { title: "En attente DEE",         desc: "Votre rapport est en cours d'examen.",     color: ORANGE,    bg: "#fff7ed", border: "#fed7aa", icon: "⏳", btn: null },
        Depose:         { title: "En attente DEE",         desc: "Votre rapport est en cours d'examen.",     color: ORANGE,    bg: "#fff7ed", border: "#fed7aa", icon: "⏳", btn: null },
        "Déposé":       { title: "En attente DEE",         desc: "Votre rapport est en cours d'examen.",     color: ORANGE,    bg: "#fff7ed", border: "#fed7aa", icon: "⏳", btn: null },
        valide_par_dee: { title: "Rapport validé ✓",       desc: "La DEE a validé votre rapport.",           color: GREEN,     bg: "#ecfdf5", border: "#6ee7b7", icon: "✅", btn: null },
        valide:         { title: "Rapport validé ✓",       desc: "La DEE a validé votre rapport.",           color: GREEN,     bg: "#ecfdf5", border: "#6ee7b7", icon: "✅", btn: null },
        accepte:        { title: "Rapport accepté ✓",      desc: "La DEE a accepté votre rapport.",          color: GREEN,     bg: "#ecfdf5", border: "#6ee7b7", icon: "✅", btn: null },
        rejete_par_dee: { title: "Rapport à corriger",     desc: "La DEE demande des corrections.",          color: RED,       bg: "#fef2f2", border: "#fca5a5", icon: "❌", btn: { label: "Corriger et redéposer", color: RED } },
        en_attente:     { title: "En cours d'examen",      desc: "Votre rapport est en cours d'examen.",     color: ORANGE,    bg: "#fff7ed", border: "#fed7aa", icon: "⏳", btn: null },
    }[status] || { title: "Rapport déposé", desc: "En attente de traitement.", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", icon: "📄", btn: null };

    return (
        <div style={{ background: meta.bg, border: `1.5px solid ${meta.border}`, borderRadius: 18, padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{meta.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: meta.color, marginBottom: 6 }}>{meta.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, lineHeight: 1.5, marginBottom: meta.btn ? 14 : 0 }}>{meta.desc}</div>
            {meta.btn && (
                <button onClick={() => router.visit("/etablissement/documents")}
                    style={{ padding: "9px 20px", borderRadius: 10, border: `1.5px solid ${meta.btn.color}`, background: "#fff", color: meta.btn.color, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                    {meta.btn.label}
                </button>
            )}
        </div>
    );
}

function Card({ title, children, delay }) {
    return (
        <section className="fade-up" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.04)", animationDelay: delay }}>
            <h3 style={{ margin: "0 0 1rem", color: "#0f172a", fontSize: 16, fontWeight: 900 }}>{title}</h3>
            {children}
        </section>
    );
}

function InfoPill({ label, value, color }) {
    return (
        <div style={{ background: "#f8fafc", border: "1px solid #eef2f7", borderRadius: 13, padding: "11px 13px" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: color || "#0f172a", fontWeight: 800 }}>{value || "—"}</div>
        </div>
    );
}

function InfoBox({ label, value }) {
    return (
        <div style={{ background: "#f8fafc", border: "1px solid #eef2f7", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>{label}</div>
            <div style={{ color: "#0f172a", fontSize: 13, fontWeight: 800 }}>{value || "—"}</div>
        </div>
    );
}

EtablissementDossierShow.layout = page => <EtablissementLayout active="dossier">{page}</EtablissementLayout>;
