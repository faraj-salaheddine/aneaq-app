import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/Layouts/SI/DashboardLayout';

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";
const RED   = "#e11d48";

function initials(name) {
    return (name || 'SI').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function PField({ label, value, onChange, error, type = 'text', red = false }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                style={{
                    height: 40, width: '100%', borderRadius: 9,
                    border: `1px solid ${red ? '#fecaca' : '#e2e8f0'}`,
                    background: '#fafbfc', padding: '0 12px', fontSize: 13, color: '#0f172a',
                    outline: 'none', transition: 'border 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = red ? RED : BLUE}
                onBlur={e => e.target.style.borderColor = red ? '#fecaca' : '#e2e8f0'}
            />
            {error && <p style={{ fontSize: 11, color: RED, margin: '4px 0 0', fontWeight: 500 }}>{error}</p>}
        </div>
    );
}

export default function Edit({ status }) {
    const { props } = usePage();
    const user = props?.auth?.user || {};
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const profileForm = useForm({ name: user.name || '', email: user.email || '' });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const deleteForm = useForm({ password: '' });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch('/si/profile', { preserveScroll: true });
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
        deleteForm.delete('/si/profile', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Mon profil — SI ANEAQ" />
            <div style={{ padding: '2.5rem 3rem', minHeight: '100vh', background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 4px', fontWeight: 500 }}>Système d'Information — Mon compte</p>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Mon profil utilisateur</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Mettez à jour vos informations et sécurisez votre compte.</p>
                </div>

                {/* Identity banner */}
                <div style={{ background: `linear-gradient(135deg, #0a2d5e 0%, ${BLUE} 100%)`, borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {initials(user.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{user.name || '—'}</p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0' }}>{user.email || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Administrateur SI</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>

                    {/* Personal info */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Informations personnelles</p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '1px 0 0' }}>Modifier le nom et l'email</p>
                            </div>
                        </div>
                        <form onSubmit={submitProfile} style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <PField label="Nom complet"    value={profileForm.data.name}  onChange={v => profileForm.setData('name', v)}  error={profileForm.errors.name} />
                                <PField label="Adresse email"  type="email" value={profileForm.data.email} onChange={v => profileForm.setData('email', v)} error={profileForm.errors.email} />
                            </div>
                            {status === 'profile-updated' && (
                                <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
                                    Profil mis à jour avec succès.
                                </div>
                            )}
                            <button type="submit" disabled={profileForm.processing} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 18px', borderRadius: 9, border: 'none', background: BLUE, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                                {profileForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </form>
                    </div>

                    {/* Password */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Sécurité</p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '1px 0 0' }}>Modifier le mot de passe</p>
                            </div>
                        </div>
                        <form onSubmit={submitPassword} style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <PField label="Mot de passe actuel"    type="password" value={passwordForm.data.current_password}     onChange={v => passwordForm.setData('current_password', v)}     error={passwordForm.errors.current_password} />
                                <PField label="Nouveau mot de passe"   type="password" value={passwordForm.data.password}             onChange={v => passwordForm.setData('password', v)}             error={passwordForm.errors.password} />
                                <PField label="Confirmer"              type="password" value={passwordForm.data.password_confirmation} onChange={v => passwordForm.setData('password_confirmation', v)} error={passwordForm.errors.password_confirmation} />
                            </div>
                            {passwordForm.recentlySuccessful && (
                                <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
                                    Mot de passe mis à jour.
                                </div>
                            )}
                            <button type="submit" disabled={passwordForm.processing} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 18px', borderRadius: 9, border: 'none', background: GREEN, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                {passwordForm.processing ? 'Mise à jour…' : 'Mettre à jour'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}

Edit.layout = page => <DashboardLayout>{page}</DashboardLayout>;
