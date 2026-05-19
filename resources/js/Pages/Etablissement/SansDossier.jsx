import { router } from '@inertiajs/react';
import EtablissementLayout from '@/Layouts/Etablissement/EtablissementLayout';

const BLUE = '#0C447C';

export default function SansDossier({ page = '' }) {
    return (
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
                {/* Illustration */}
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 38 }}>
                    📂
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                    Aucun dossier affecté
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' }}>
                    Votre établissement n'a pas encore de dossier d'évaluation assigné.
                    {page ? ` La page « ${page} » sera disponible dès que la DEE vous affectera un dossier.` : ' Cette section sera disponible dès que la DEE vous affectera un dossier.'}
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => router.visit(route('etablissement.dashboard'))}
                        style={{ padding: '10px 22px', borderRadius: 9, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                        ← Retour au tableau de bord
                    </button>
                    <button
                        onClick={() => router.visit(route('etablissement.profil.show'))}
                        style={{ padding: '10px 22px', borderRadius: 9, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                        Compléter mon profil
                    </button>
                </div>

                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 28 }}>
                    Pour toute question, utilisez la messagerie ou contactez la DEE.
                </p>
            </div>
        </div>
    );
}

SansDossier.layout = page => <EtablissementLayout>{page}</EtablissementLayout>;
