import { router } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';

export default function EnAttenteAnnexes({ dossier, expert }) {
    return (
        <ExpertLayout>
            <div style={{ padding: '28px', maxWidth: 700, margin: '0 auto' }}>
                <button
                    onClick={() => router.visit(route('evaluations-annexes.liste'))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', fontWeight: 700, marginBottom: 24, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                    ← Retour aux dossiers
                </button>

                <div style={{ background: '#fff', border: '1px solid #e4e7f0', borderRadius: 16, padding: '48px 40px', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
                        ⏳
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1f2e', margin: '0 0 10px' }}>
                        Annexes en attente de transmission
                    </h2>

                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: '0 0 8px' }}>
                        La DEE n'a pas encore transmis les annexes de ce dossier pour évaluation.
                    </p>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 28px' }}>
                        Vous serez notifié dès que les annexes seront disponibles.
                    </p>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'inline-block', textAlign: 'left' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dossier</p>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1f2e', margin: 0 }}>{dossier.nom || dossier.reference}</p>
                        {dossier.nom && <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{dossier.reference}</p>}
                    </div>
                </div>
            </div>
        </ExpertLayout>
    );
}
