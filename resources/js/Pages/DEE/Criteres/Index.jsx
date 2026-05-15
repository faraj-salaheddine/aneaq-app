import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';
import ConfirmModal from '@/Components/ConfirmModal';

const BLUE  = '#0C447C';
const GREEN = '#1D9E75';

function FormModal({ title, initial, axes, onClose, onSubmit, isNew }) {
    const { data, setData, processing, errors } = useForm({
        parent_id: initial?.parent_id ?? '',
        code:      initial?.code ?? '',
        libelle:   initial?.libelle ?? '',
        poids:     initial?.poids ?? 0,
        ordre:     initial?.ordre ?? 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data);
    };

    const field = (label, key, type = 'text', extra = {}) => (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>{label}</label>
            <input
                type={type}
                value={data[key]}
                onChange={e => setData(key, e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${errors[key] ? '#e11d48' : '#e2e8f0'}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
                {...extra}
            />
            {errors[key] && <div style={{ color: '#e11d48', fontSize: 11, marginTop: 3 }}>{errors[key]}</div>}
        </div>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: BLUE, margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>Axe parent (laisser vide pour un axe racine)</label>
                        <select
                            value={data.parent_id}
                            onChange={e => setData('parent_id', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff' }}
                        >
                            <option value="">— Axe racine —</option>
                            {axes.map(a => (
                                <option key={a.id} value={a.id}>{a.code} — {a.libelle}</option>
                            ))}
                        </select>
                    </div>

                    {field('Code', 'code', 'text', { placeholder: 'ex: C1.3' })}
                    {field('Libellé', 'libelle', 'text', { placeholder: 'ex: Gouvernance' })}
                    {field('Poids (%)', 'poids', 'number', { min: 0, max: 100, step: 0.01 })}
                    {field('Ordre', 'ordre', 'number', { min: 0 })}

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                        <button type="button" onClick={onClose} style={{ padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: 9, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={processing} style={{ padding: '9px 22px', border: 'none', borderRadius: 9, background: BLUE, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                            {processing ? '…' : isNew ? 'Ajouter' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CriteresIndex({ axes }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const [modal, setModal]   = useState(null);
    const [dialog, setDialog] = useState(null);

    const flatAxes = axes;

    const doAdd = (data) => {
        router.post(route('dee.criteres.store'), {
            ...data,
            parent_id: data.parent_id || null,
        }, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });
    };

    const doEdit = (critere, data) => {
        router.patch(route('dee.criteres.update', critere.id), data, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });
    };

    const doDelete = (critere) => {
        setDialog({
            message: `Supprimer "${critere.libelle}" ?`,
            onConfirm: () => { setDialog(null); router.delete(route('dee.criteres.destroy', critere.id), { preserveScroll: true }); },
        });
    };

    const totalCriteres = axes.reduce((acc, a) => acc + (a.enfants?.length ?? 0), 0);

    return (
        <DashboardShell title="Paramétrage critères">
            <Head title="Critères d'évaluation"/>

            {dialog && (
                <ConfirmModal
                    title="Supprimer le critère"
                    message={dialog.message}
                    danger
                    confirmLabel="Supprimer"
                    onConfirm={dialog.onConfirm}
                    onCancel={() => setDialog(null)}
                />
            )}

            {modal && (
                <FormModal
                    title={modal.type === 'new' ? 'Nouveau critère / axe' : `Modifier "${modal.item?.libelle}"`}
                    initial={modal.item}
                    axes={flatAxes}
                    isNew={modal.type === 'new'}
                    onClose={() => setModal(null)}
                    onSubmit={modal.type === 'new' ? doAdd : (data) => doEdit(modal.item, data)}
                />
            )}

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>

                {flash.success && (
                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', fontSize: 14 }}>{flash.success}</div>
                )}
                {flash.error && (
                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 14 }}>{flash.error}</div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: BLUE, margin: 0 }}>Critères d'évaluation</h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
                            {axes.length} axe{axes.length !== 1 ? 's' : ''} · {totalCriteres} critère{totalCriteres !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ type: 'new', item: null })}
                        style={{ padding: '9px 20px', background: BLUE, color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 16 }}>+</span> Nouveau critère
                    </button>
                </div>

                {axes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 15 }}>Aucun critère configuré</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {axes.map(axe => (
                            <div key={axe.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                {/* Axe header */}
                                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${BLUE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: BLUE }}>{axe.code}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{axe.libelle}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Poids: {axe.poids}% · Ordre: {axe.ordre} · {axe.enfants?.length ?? 0} critère{(axe.enfants?.length ?? 0) !== 1 ? 's' : ''}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button onClick={() => setModal({ type: 'edit', item: axe })} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#334155' }}>Modifier</button>
                                        <button onClick={() => doDelete(axe)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid #fee2e2', background: '#fef2f2', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#e11d48' }}>Supprimer</button>
                                    </div>
                                </div>

                                {/* Critères */}
                                {(axe.enfants ?? []).length > 0 && (
                                    <div>
                                        {(axe.enfants ?? []).map((c, ci) => (
                                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: ci < axe.enfants.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>{c.code}</span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.libelle}</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Poids: {c.poids}% · Ordre: {c.ordre}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                                    <button onClick={() => setModal({ type: 'edit', item: c })} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#334155' }}>Modifier</button>
                                                    <button onClick={() => doDelete(c)} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fef2f2', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#e11d48' }}>Supprimer</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
