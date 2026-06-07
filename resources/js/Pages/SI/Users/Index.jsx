import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/SI/DashboardLayout';
import ConfirmModal from '@/Components/ConfirmModal';

const ROLE_META = {
    admin_dee:     { label: 'DEE',            color: '#0C447C', bg: '#EBF4FF' },
    expert:        { label: 'Expert',          color: '#1D9E75', bg: '#ECFDF5' },
    si:            { label: 'SI',              color: '#7C3AED', bg: '#EDE9FE' },
    etablissement: { label: 'Établissement',   color: '#EF9F27', bg: '#FFFBEB' },
};

function RoleBadge({ role }) {
    const meta = ROLE_META[role] ?? { label: role, color: '#64748b', bg: '#f8fafc' };
    return (
        <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            color: meta.color, background: meta.bg, border: `1px solid ${meta.color}22`,
        }}>
            {meta.label}
        </span>
    );
}

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                background: checked ? '#1D9E75' : '#cbd5e1',
                position: 'relative', transition: 'background 0.2s',
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <span style={{
                position: 'absolute', top: 2,
                left: checked ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
            }}/>
        </button>
    );
}

function GestionUsersIndex({ users, filters }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const [search, setSearch]   = useState(filters.search ?? '');
    const [role, setRole]       = useState(filters.role ?? '');
    const [loading, setLoading] = useState(null);
    const [newPass, setNewPass] = useState(null);
    const [dialog, setDialog]   = useState(null);

    const applyFilters = () => {
        router.get(route('si.users.index'), { search, role }, { preserveState: true, replace: true });
    };

    const handleToggle = (user) => {
        if (loading) return;
        setLoading(`toggle-${user.id}`);
        router.patch(route('si.users.toggle', user.id), {}, {
            preserveScroll: true,
            onFinish: () => setLoading(null),
        });
    };

    const handleReset = (user) => {
        setDialog({
            message: `Réinitialiser le mot de passe de ${user.name} ?`,
            onConfirm: () => {
                setDialog(null);
                setLoading(`reset-${user.id}`);
                router.post(route('si.users.reset-password', user.id), {}, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        const msg = page.props.flash?.success ?? '';
                        const match = msg.match(/:\s*(\S+)$/);
                        if (match) setNewPass({ id: user.id, name: user.name, email: user.email, password: match[1], sent: false });
                    },
                    onFinish: () => setLoading(null),
                });
            },
        });
    };

    const handleSendEmail = () => {
        if (!newPass) return;
        router.post(`/si/users/${newPass.id}/send-password`, { password: newPass.password }, {
            preserveScroll: true,
            onSuccess: () => setNewPass(p => ({ ...p, sent: true })),
        });
    };

    return (
        <>
            <Head title="Gestion utilisateurs" />
            {dialog && (
                <ConfirmModal
                    message={dialog.message}
                    title="Confirmation"
                    confirmLabel="Confirmer"
                    onConfirm={dialog.onConfirm}
                    onCancel={() => setDialog(null)}
                />
            )}

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

                {/* Flash success */}
                {flash.success && !newPass && (
                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', fontSize: 14 }}>
                        {flash.success}
                    </div>
                )}

                {/* New password modal */}
                {newPass && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>🔑</div>
                            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>Nouveau mot de passe</h3>
                            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 8px' }}>
                                Communiquez ce mot de passe à <strong>{newPass.name}</strong> :
                            </p>
                            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>{newPass.email}</p>
                            <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: 10, fontFamily: 'monospace', fontSize: 20, fontWeight: 700, letterSpacing: 2, color: '#0C447C', marginBottom: 20 }}>
                                {newPass.password}
                            </div>

                            {newPass.sent && (
                                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Email envoyé à {newPass.email}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={newPass.sent}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: newPass.sent ? '#f0fdf4' : '#1D9E75', color: newPass.sent ? '#16a34a' : '#fff', border: newPass.sent ? '1px solid #86efac' : 'none', cursor: newPass.sent ? 'default' : 'pointer', fontWeight: 600, fontSize: 13 }}>
                                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    {newPass.sent ? 'Email envoyé' : 'Envoyer par email'}
                                </button>
                                <button
                                    onClick={() => setNewPass(null)}
                                    style={{ padding: '10px 20px', borderRadius: 8, background: '#0C447C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0C447C', margin: 0 }}>Gestion des utilisateurs</h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
                        {users.total} utilisateur{users.total !== 1 ? 's' : ''} au total
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Rechercher nom ou email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ flex: 1, minWidth: 220, padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    />
                    <select
                        value={role}
                        onChange={e => { setRole(e.target.value); router.get(route('si.users.index'), { search, role: e.target.value }, { preserveState: true, replace: true }); }}
                        style={{ padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}
                    >
                        <option value="">Tous les rôles</option>
                        {Object.entries(ROLE_META).map(([r, m]) => (
                            <option key={r} value={r}>{m.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={applyFilters}
                        style={{ padding: '8px 20px', background: '#0C447C', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        Filtrer
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['Utilisateur', 'Rôle', 'Statut', 'Actif', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : users.data.map((user, i) => (
                                <tr key={user.id} style={{ borderBottom: i < users.data.length - 1 ? '1px solid #f1f5f9' : 'none', background: user.is_active ? '#fff' : '#fef2f2' }}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{user.name}</div>
                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                                            color: user.is_active ? '#065F46' : '#991B1B',
                                            background: user.is_active ? '#ECFDF5' : '#FEF2F2',
                                        }}>
                                            {user.is_active ? 'Actif' : 'Désactivé'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Toggle
                                            checked={user.is_active}
                                            onChange={() => handleToggle(user)}
                                            disabled={loading === `toggle-${user.id}`}
                                        />
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <button
                                            onClick={() => handleReset(user)}
                                            disabled={loading === `reset-${user.id}`}
                                            style={{
                                                padding: '6px 14px', borderRadius: 7,
                                                border: '1.5px solid #e2e8f0', background: '#fff',
                                                color: '#334155', fontSize: 12, fontWeight: 600,
                                                cursor: loading === `reset-${user.id}` ? 'not-allowed' : 'pointer',
                                                opacity: loading === `reset-${user.id}` ? 0.6 : 1,
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                            Reset MDP
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                        {users.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                style={{
                                    padding: '6px 12px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                                    border: '1.5px solid ' + (link.active ? '#0C447C' : '#e2e8f0'),
                                    background: link.active ? '#0C447C' : '#fff',
                                    color: link.active ? '#fff' : link.url ? '#334155' : '#94a3b8',
                                    cursor: link.url ? 'pointer' : 'default',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

GestionUsersIndex.layout = page => <DashboardLayout>{page}</DashboardLayout>;

export default GestionUsersIndex;
