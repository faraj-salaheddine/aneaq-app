import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

const BLUE  = '#0C447C';
const GREEN = '#1D9E75';

function StatusBadge({ statut }) {
    const meta = statut === 'repondu'
        ? { label: 'Répondu',    color: GREEN,     bg: '#ECFDF5' }
        : { label: 'En attente', color: '#d97706', bg: '#fef9c3' };
    return (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, color: meta.color, background: meta.bg }}>
            {meta.label}
        </span>
    );
}

function QuestionCard({ q, onReponse }) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ background: '#fff', borderRadius: 14, border: q.statut === 'en_attente' ? '1.5px solid #fde68a' : '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <StatusBadge statut={q.statut}/>
                        {q.dossier && (
                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                                {q.dossier.reference} · {q.dossier.etablissement}
                            </span>
                        )}
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{q.created_at}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{q.question}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Posée par {q.auteur}</div>

                    {q.reponse && (
                        <div style={{ marginTop: 10, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, borderLeft: `3px solid ${GREEN}` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, marginBottom: 4 }}>
                                Réponse de {q.repondu_par} · {q.repondu_le}
                            </div>
                            <div style={{ fontSize: 13, color: '#0f172a' }}>{q.reponse}</div>
                        </div>
                    )}
                </div>

                {q.statut === 'en_attente' && (
                    <button
                        onClick={() => setOpen(v => !v)}
                        style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 8, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        {open ? 'Annuler' : 'Répondre'}
                    </button>
                )}
            </div>

            {open && (
                <ReponseForm questionId={q.id} onClose={() => setOpen(false)} onReponse={onReponse}/>
            )}
        </div>
    );
}

function ReponseForm({ questionId, onClose, onReponse }) {
    const { data, setData, post, processing, errors } = useForm({ reponse: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('dee.questions-reponses.repondre', questionId), {
            preserveScroll: true,
            onSuccess: () => { onReponse(); onClose(); },
        });
    };

    return (
        <form onSubmit={submit} style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <textarea
                value={data.reponse}
                onChange={e => setData('reponse', e.target.value)}
                placeholder="Votre réponse…"
                rows={4}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            {errors.reponse && <div style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{errors.reponse}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Annuler
                </button>
                <button type="submit" disabled={processing || !data.reponse.trim()} style={{ padding: '8px 20px', borderRadius: 8, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: processing ? 0.7 : 1 }}>
                    {processing ? '…' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
}

export default function QuestionsReponses({ questions, filters, pending }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const [search, setSearch] = useState(filters.search ?? '');
    const [statut, setStatut] = useState(filters.statut ?? '');

    const applyFilters = (newStatut) => {
        router.get(route('dee.questions-reponses.index'), { search, statut: newStatut ?? statut }, { preserveState: true, replace: true });
    };

    return (
        <DashboardShell title="Questions & Réponses">
            <Head title="Questions & Réponses"/>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

                {flash.success && (
                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', fontSize: 14 }}>
                        {flash.success}
                    </div>
                )}

                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: BLUE, margin: 0 }}>Questions & Réponses</h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
                            {questions.total} question{questions.total !== 1 ? 's' : ''} au total
                        </p>
                    </div>
                    {pending > 0 && (
                        <div style={{ padding: '8px 16px', borderRadius: 99, background: '#fef9c3', border: '1px solid #fde68a', fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                            ⚡ {pending} question{pending !== 1 ? 's' : ''} en attente
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Rechercher…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ flex: 1, minWidth: 200, padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    />
                    <select
                        value={statut}
                        onChange={e => { setStatut(e.target.value); applyFilters(e.target.value); }}
                        style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="repondu">Répondus</option>
                    </select>
                    <button onClick={() => applyFilters()} style={{ padding: '8px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        Filtrer
                    </button>
                </div>

                {questions.data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 15 }}>Aucune question trouvée</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {questions.data.map(q => (
                            <QuestionCard key={q.id} q={q} onReponse={() => router.reload()}/>
                        ))}
                    </div>
                )}

                {questions.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                        {questions.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                style={{
                                    padding: '6px 12px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                                    border: '1.5px solid ' + (link.active ? BLUE : '#e2e8f0'),
                                    background: link.active ? BLUE : '#fff',
                                    color: link.active ? '#fff' : link.url ? '#334155' : '#94a3b8',
                                    cursor: link.url ? 'pointer' : 'default',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
