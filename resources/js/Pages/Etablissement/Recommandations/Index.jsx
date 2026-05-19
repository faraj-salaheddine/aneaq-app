import { useState, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import EtablissementLayout from "@/Layouts/Etablissement/EtablissementLayout";

const STATUT_CONFIG = {
    envoyee_etablissement: { label: "À traiter",  bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
    en_cours:              { label: "En cours",   bg: "#fefce8", color: "#a16207", border: "#fef08a" },
    cloturee:              { label: "Clôturée",   bg: "#f0fdf4", color: "#166534", border: "#86efac" },
};

function Badge({ statut }) {
    const cfg = STATUT_CONFIG[statut] || { label: statut, bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
    return (
        <span style={{
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
        }}>
            {cfg.label}
        </span>
    );
}

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={onClose}>
            <div style={{
                background: "#fff", borderRadius: 16, padding: "28px 32px", width: 500, maxWidth: "95vw",
                boxShadow: "0 20px 60px rgba(0,0,0,.18)", maxHeight: "90vh", overflowY: "auto",
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
                    <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Btn({ onClick, color = "#0C447C", children, disabled = false, style = {}, type = "button" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                background: disabled ? "#e2e8f0" : color, color: disabled ? "#94a3b8" : "#fff",
                border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13,
                fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", ...style,
            }}
        >
            {children}
        </button>
    );
}

export default function Index({ dossier, recommandations = [], preuves = [] }) {
    const { flash = {} } = usePage().props;

    const [modal, setModal]         = useState(null);
    const [selected, setSelected]   = useState(null);
    const [reponse, setReponse]     = useState("");
    const [delai, setDelai]         = useState("");
    const [description, setDescr]   = useState("");
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef(null);

    const close = () => { setModal(null); setSelected(null); setReponse(""); setDelai(""); setDescr(""); };

    const base = `/etablissement/recommandations/${dossier.id}`;

    function submitReponse() {
        if (!reponse.trim() || !delai) return;
        setProcessing(true);
        router.post(`${base}/${selected.id}/repondre`, { reponse_etablissement: reponse, delai_etablissement: delai }, {
            onFinish: () => { setProcessing(false); close(); },
        });
    }

    function submitPreuve() {
        const file = fileRef.current?.files?.[0];
        if (!file) return;
        setProcessing(true);
        const form = new FormData();
        form.append("fichier", file);
        form.append("description", description);
        router.post(`${base}/${selected.id}/preuve`, form, {
            onFinish: () => { setProcessing(false); close(); },
        });
    }

    const aTraiter = recommandations.filter(r => r.statut === "envoyee_etablissement");
    const enCours  = recommandations.filter(r => r.statut === "en_cours");
    const cloturees = recommandations.filter(r => r.statut === "cloturee");

    // Map preuve to recommandation_id for quick access
    const preuvesByReco = preuves.reduce((acc, p) => {
        if (!acc[p.recommandation_id]) acc[p.recommandation_id] = [];
        acc[p.recommandation_id].push(p);
        return acc;
    }, {});

    return (
        <>
            <Head title={`Recommandations — ${dossier.reference}`} />
            <EtablissementLayout>
                <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px", fontFamily: "Inter, Arial, sans-serif" }}>
                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                            Recommandations — {dossier.reference}
                        </h1>
                        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
                            Consultez chaque recommandation, indiquez votre délai de mise en œuvre et déposez vos preuves.
                        </p>
                    </div>

                    {/* Flash */}
                    {flash.success && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#166534", fontSize: 14 }}>
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#991b1b", fontSize: 14 }}>
                            {flash.error}
                        </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
                        {[
                            { label: "À traiter", val: aTraiter.length, color: "#7c3aed" },
                            { label: "En cours", val: enCours.length, color: "#a16207" },
                            { label: "Clôturées", val: cloturees.length, color: "#166534" },
                        ].map(s => (
                            <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
                                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* List */}
                    {recommandations.length === 0 ? (
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            Aucune recommandation reçue pour le moment.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {recommandations.map(r => {
                                const rPreuves = preuvesByReco[r.id] || [];
                                return (
                                    <div key={r.id} style={{
                                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
                                        padding: "20px 22px",
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                                                    <Badge statut={r.statut} />
                                                    {r.domaine_code && (
                                                        <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{r.domaine_code}</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{r.recommandation}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                                                {r.statut === "envoyee_etablissement" && (
                                                    <Btn color="#0C447C" onClick={() => { setSelected(r); setModal("repondre"); }}>
                                                        Répondre
                                                    </Btn>
                                                )}
                                                {r.statut === "en_cours" && (
                                                    <Btn color="#7c3aed" onClick={() => { setSelected(r); setModal("preuve"); }}>
                                                        Déposer une preuve
                                                    </Btn>
                                                )}
                                            </div>
                                        </div>

                                        {/* Réponse établissement */}
                                        {r.reponse_etablissement && (
                                            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af", marginTop: 8 }}>
                                                <strong>Votre réponse :</strong> {r.reponse_etablissement}
                                                {r.delai_etablissement && (
                                                    <span style={{ display: "inline-block", marginLeft: 12, background: "#dbeafe", color: "#1d4ed8", borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                                                        Délai : {r.delai_etablissement}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Preuves */}
                                        {rPreuves.length > 0 && (
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    Preuves déposées ({rPreuves.length})
                                                </div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                    {rPreuves.map(p => (
                                                        <div key={p.id} style={{
                                                            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
                                                            padding: "6px 12px", fontSize: 12, color: "#374151",
                                                            display: "flex", alignItems: "center", gap: 8,
                                                        }}>
                                                            <span>📎</span>
                                                            <span>{p.fichier_nom}</span>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm("Supprimer cette preuve ?")) {
                                                                        router.delete(`${base}/preuves/${p.id}`);
                                                                    }
                                                                }}
                                                                style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0 }}
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add proof button for en_cours with existing proofs */}
                                        {r.statut === "en_cours" && rPreuves.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <button
                                                    onClick={() => { setSelected(r); setModal("preuve"); }}
                                                    style={{ fontSize: 12, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                                                >
                                                    + Ajouter une autre preuve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Modals ── */}

                    {/* Répondre */}
                    <Modal open={modal === "repondre"} onClose={close} title="Répondre à la recommandation">
                        {selected && (
                            <>
                                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#374151", marginBottom: 16 }}>
                                    {selected.recommandation}
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                        Votre réponse / plan de mise en œuvre *
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={reponse}
                                        onChange={e => setReponse(e.target.value)}
                                        placeholder="Décrivez comment vous comptez mettre en œuvre cette recommandation..."
                                        style={{
                                            width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px",
                                            fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                        Date prévisionnelle de réalisation *
                                    </label>
                                    <input
                                        type="date"
                                        value={delai}
                                        onChange={e => setDelai(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        style={{
                                            width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px",
                                            fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                    <Btn color="#e2e8f0" onClick={close} style={{ color: "#374151" }}>Annuler</Btn>
                                    <Btn color="#0C447C" disabled={processing || !reponse.trim() || !delai} onClick={submitReponse}>
                                        Enregistrer la réponse
                                    </Btn>
                                </div>
                            </>
                        )}
                    </Modal>

                    {/* Déposer preuve */}
                    <Modal open={modal === "preuve"} onClose={close} title="Déposer une preuve de réalisation">
                        {selected && (
                            <>
                                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#374151", marginBottom: 16 }}>
                                    {selected.recommandation}
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                        Fichier (PDF, Word, Image, Excel — max 10 Mo) *
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileRef}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                                        style={{ fontSize: 13 }}
                                    />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                        Description (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescr(e.target.value)}
                                        placeholder="ex: PV de réunion, rapport d'avancement..."
                                        style={{
                                            width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px",
                                            fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                    <Btn color="#e2e8f0" onClick={close} style={{ color: "#374151" }}>Annuler</Btn>
                                    <Btn color="#7c3aed" disabled={processing} onClick={submitPreuve}>
                                        Déposer la preuve
                                    </Btn>
                                </div>
                            </>
                        )}
                    </Modal>
                </div>
            </EtablissementLayout>
        </>
    );
}
