import { useEffect } from 'react';

const VARIANTS = {
    danger: {
        icon: (
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        ),
        iconBg:   '#fef2f2',
        confirmBg: '#ef4444',
        confirmHover: '#dc2626',
    },
    warning: {
        icon: (
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        ),
        iconBg:   '#fffbeb',
        confirmBg: '#f59e0b',
        confirmHover: '#d97706',
    },
    info: {
        icon: (
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0C447C" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        ),
        iconBg:   '#EBF4FF',
        confirmBg: '#0C447C',
        confirmHover: '#0a3a6b',
    },
    success: {
        icon: (
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        ),
        iconBg:   '#ecfdf5',
        confirmBg: '#1D9E75',
        confirmHover: '#178a63',
    },
};

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel  = 'Annuler',
    type         = 'info',
    onConfirm,
    onCancel,
}) {
    const v = VARIANTS[type] ?? VARIANTS.info;

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(15,23,42,0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 99999, padding: 24,
                animation: 'cdFadeIn .18s ease both',
            }}
        >
            <style>{`
                @keyframes cdFadeIn  { from { opacity:0 } to { opacity:1 } }
                @keyframes cdSlideUp { from { opacity:0; transform:translateY(14px) scale(.97) } to { opacity:1; transform:none } }
                .cd-confirm-btn { transition: background .15s, box-shadow .15s; }
                .cd-confirm-btn:hover { filter: brightness(.92); }
                .cd-cancel-btn  { transition: background .15s; }
                .cd-cancel-btn:hover  { background: #f1f5f9 !important; }
            `}</style>

            <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '2rem',
                width: '100%',
                maxWidth: 440,
                boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                animation: 'cdSlideUp .22s cubic-bezier(.22,1,.36,1) both',
            }}>

                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: v.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {v.icon}
                    </div>
                    <div style={{ flex: 1, paddingTop: 2 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.3 }}>
                            {title}
                        </h3>
                        {message && (
                            <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.6, fontWeight: 400 }}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 20px' }} />

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        className="cd-cancel-btn"
                        style={{
                            padding: '9px 20px', borderRadius: 10,
                            border: '1px solid #e2e8f0', background: '#fff',
                            fontSize: 13.5, fontWeight: 600, color: '#64748b',
                            cursor: 'pointer',
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="cd-confirm-btn"
                        style={{
                            padding: '9px 22px', borderRadius: 10,
                            border: 'none', background: v.confirmBg,
                            fontSize: 13.5, fontWeight: 700, color: '#fff',
                            cursor: 'pointer',
                            boxShadow: `0 4px 14px ${v.confirmBg}40`,
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
