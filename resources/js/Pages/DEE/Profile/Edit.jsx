import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardShell from '@/Layouts/DashboardShell';
import ConfirmModal from '@/Components/ConfirmModal';

const ACCENT = "#2563eb";
const GREEN  = "#1D9E75";
const RED    = "#e11d48";

function initials(name) {
    return (name || 'AD').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Edit({ status }) {
    const { props } = usePage();
    const user = props?.auth?.user || {};
    const [dialog, setDialog] = useState(null);

    const profileForm = useForm({
        name:  user.name  || '',
        email: user.email || '',
    });

    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const deleteForm = useForm({ password: '' });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch('/profile', { preserveScroll: true });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset('current_password', 'password', 'password_confirmation'),
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();
        setDialog({
            message: 'Voulez-vous vraiment supprimer ce compte ? Cette action est irréversible.',
            onConfirm: () => { setDialog(null); deleteForm.delete('/profile', { preserveScroll: true }); },
        });
    };

    return (
        <>
            <Head title="Mon profil — DEE ANEAQ" />
            {dialog && (
                <ConfirmModal
                    title="Supprimer le compte"
                    message={dialog.message}
                    danger
                    confirmLabel="Supprimer définitivement"
                    onConfirm={dialog.onConfirm}
                    onCancel={() => setDialog(null)}
                />
            )}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .dee-profile * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                @keyframes dee-fu { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .dee-fu { animation: dee-fu 0.3s ease both; }
                .dee-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; outline: none; }
                .dee-input-red:focus { border-color: #e11d48 !important; box-shadow: 0 0 0 3px rgba(225,29,72,0.1) !important; outline: none; }
            `}</style>

            <div className="dee-profile" style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* ── Header ── */}
                <div className="dee-fu" style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>DEE — Mon compte</p>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
                        Mon profil utilisateur
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: 0, fontWeight: 500 }}>
                        Mettez à jour vos informations personnelles et sécurisez votre compte.
                    </p>
                </div>

                {/* ── Identity banner ── */}
                <div className="dee-fu" style={{ background: `linear-gradient(135deg, #0f2d6e 0%, ${ACCENT} 100%)`, borderRadius: 18, padding: '1.75rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 20, animationDelay: '0.04s' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {initials(user.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{user.name || '—'}</p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>{user.email || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Administrateur DEE</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>

                    {/* ── Personal info ── */}
                    <div className="dee-fu" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animationDelay: '0.08s' }}>
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Informations personnelles</p>
                                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>Modifier le nom et l'email</p>
                            </div>
                        </div>
                        <form onSubmit={submitProfile} style={{ padding: '1.5rem 1.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <PField label="Nom complet" value={profileForm.data.name} onChange={v => profileForm.setData('name', v)} error={profileForm.errors.name} />
                                <PField label="Adresse email" type="email" value={profileForm.data.email} onChange={v => profileForm.setData('email', v)} error={profileForm.errors.email} />
                            </div>
                            {status === 'profile-updated' && (
                                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
                                    Profil mis à jour avec succès.
                                </div>
                            )}
                            <button type="submit" disabled={profileForm.processing} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 10, border: 'none', background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, cursor: profileForm.processing ? 'not-allowed' : 'pointer', opacity: profileForm.processing ? 0.7 : 1 }}>
                                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                {profileForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </form>
                    </div>

                    {/* ── Password ── */}
                    <div className="dee-fu" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animationDelay: '0.12s' }}>
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Sécurité du compte</p>
                                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>Modifier le mot de passe</p>
                            </div>
                        </div>
                        <form onSubmit={submitPassword} style={{ padding: '1.5rem 1.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <PField label="Mot de passe actuel"    type="password" value={passwordForm.data.current_password}      onChange={v => passwordForm.setData('current_password', v)}      error={passwordForm.errors.current_password} />
                                <PField label="Nouveau mot de passe"   type="password" value={passwordForm.data.password}              onChange={v => passwordForm.setData('password', v)}              error={passwordForm.errors.password} />
                                <PField label="Confirmer mot de passe" type="password" value={passwordForm.data.password_confirmation}  onChange={v => passwordForm.setData('password_confirmation', v)} error={passwordForm.errors.password_confirmation} />
                            </div>
                            {passwordForm.recentlySuccessful && (
                                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
                                    Mot de passe mis à jour avec succès.
                                </div>
                            )}
                            <button type="submit" disabled={passwordForm.processing} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 10, border: 'none', background: GREEN, color: '#fff', fontSize: 13, fontWeight: 700, cursor: passwordForm.processing ? 'not-allowed' : 'pointer', opacity: passwordForm.processing ? 0.7 : 1 }}>
                                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                {passwordForm.processing ? 'Mise à jour…' : 'Mettre à jour'}
                            </button>
                        </form>
                    </div>

                    {/* ── Delete account ── */}
                    <div className="dee-fu" style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', animationDelay: '0.16s' }}>
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #fee2e2', background: '#fff8f8', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: RED, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Zone sensible</p>
                                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>Suppression du compte</p>
                            </div>
                        </div>
                        <form onSubmit={submitDelete} style={{ padding: '1.5rem 1.75rem' }}>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>
                                Cette action est <strong style={{ color: '#0f172a' }}>définitive et irréversible</strong>. Toutes les données associées à ce compte seront supprimées. Confirmez avec votre mot de passe actuel.
                            </p>
                            <div style={{ maxWidth: 320, marginBottom: 16 }}>
                                <PField label="Mot de passe de confirmation" type="password" colorClass="dee-input-red" value={deleteForm.data.password} onChange={v => deleteForm.setData('password', v)} error={deleteForm.errors.password} />
                            </div>
                            <button type="submit" disabled={deleteForm.processing} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 10, border: 'none', background: RED, color: '#fff', fontSize: 13, fontWeight: 700, cursor: deleteForm.processing ? 'not-allowed' : 'pointer', opacity: deleteForm.processing ? 0.7 : 1 }}>
                                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                {deleteForm.processing ? 'Suppression…' : 'Supprimer le compte'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}

function PField({ label, value, onChange, error, type = 'text', colorClass = 'dee-input' }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className={colorClass}
                style={{ height: 40, width: '100%', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fafbfc', padding: '0 12px', fontSize: 13, color: '#0f172a', transition: 'border 0.15s, box-shadow 0.15s' }}
            />
            {error && <p style={{ fontSize: 11, color: '#e11d48', margin: '4px 0 0', fontWeight: 500 }}>{error}</p>}
        </div>
    );
}

Edit.layout = (page) => <DashboardShell>{page}</DashboardShell>;
