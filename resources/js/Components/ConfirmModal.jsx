import { useEffect } from 'react';

export default function ConfirmModal({ message, title = 'Confirmation', confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger = false, onConfirm, onCancel }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onCancel]);

    const confirmColor = danger ? '#ef4444' : '#0C447C';
    const confirmHover = danger ? '#dc2626' : '#0a3a6e';

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'cmFadeIn 0.15s ease',
            }}
        >
            <style>{`
                @keyframes cmFadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes cmSlideUp { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .cm-confirm-btn:hover { background: ${confirmHover} !important; }
                .cm-cancel-btn:hover { background: #f1f5f9 !important; }
            `}</style>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 18, padding: '32px 28px',
                    width: 420, maxWidth: '90vw',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                    animation: 'cmSlideUp 0.18s ease',
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                    background: danger ? '#fef2f2' : '#eff6ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {danger ? (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    ) : (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#0C447C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    )}
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{message}</p>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                        className="cm-cancel-btn"
                        onClick={onCancel}
                        style={{
                            padding: '9px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0',
                            background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'background 0.15s',
                        }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className="cm-confirm-btn"
                        onClick={onConfirm}
                        style={{
                            padding: '9px 22px', borderRadius: 9, border: 'none',
                            background: confirmColor, color: '#fff', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'background 0.15s',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
