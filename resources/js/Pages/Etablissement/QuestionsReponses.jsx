import { Head, useForm, usePage } from '@inertiajs/react';
import EtablissementLayout from '@/Layouts/Etablissement/EtablissementLayout';

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

function NouvelleQuestionForm({ dossierId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ question: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('etablissement.questions-reponses.store', dossierId), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: BLUE, marginBottom: 12 }}>Poser une nouvelle question</div>
            <textarea
                value={data.question}
                onChange={e => setData('question', e.target.value)}
                placeholder="Décrivez votre question ou demande de clarification…"
                rows={4}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            {errors.question && <div style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{errors.question}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="submit" disabled={processing || !data.question.trim()} style={{ padding: '9px 24px', borderRadius: 9, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: processing ? 0.7 : 1 }}>
                    {processing ? 'Envoi…' : 'Envoyer la question'}
                </button>
            </div>
        </form>
    );
}

export default function QuestionsReponses({ dossier, questions }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <EtablissementLayout active="qr">
            <Head title="Questions & Réponses"/>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

                {flash.success && (
                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', fontSize: 14 }}>
                        {flash.success}
                    </div>
                )}

                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: BLUE, margin: 0 }}>Questions & Réponses</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Dossier {dossier.reference}</p>
                </div>

                <NouvelleQuestionForm dossierId={dossier.id}/>

                {questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>Vous n'avez pas encore posé de questions.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {questions.map(q => (
                            <div key={q.id} style={{ background: '#fff', borderRadius: 14, border: q.statut === 'en_attente' ? '1.5px solid #fde68a' : '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <StatusBadge statut={q.statut}/>
                                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{q.created_at}</span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 8 }}>{q.question}</div>

                                {q.reponse ? (
                                    <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, borderLeft: `3px solid ${GREEN}` }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, marginBottom: 4 }}>
                                            Réponse DEE · {q.repondu_le}
                                        </div>
                                        <div style={{ fontSize: 13, color: '#0f172a' }}>{q.reponse}</div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>En attente de réponse de la DEE…</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </EtablissementLayout>
    );
}
