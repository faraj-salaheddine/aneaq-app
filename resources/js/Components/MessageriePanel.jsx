import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BLUE  = "#0C447C";
const GREEN = "#1D9E75";

const ROLE_LABEL = {
    admin_dee:      { label: 'DEE',          color: BLUE,   bg: '#EBF4FF' },
    expert:         { label: 'Expert',        color: GREEN,  bg: '#ECFDF5' },
    etablissement:  { label: 'Établissement', color: '#EF9F27', bg: '#FFFBEB' },
};

export default function MessageriePanel({ dossierId, currentRole }) {
    const [messages, setMessages]   = useState([]);
    const [contenu, setContenu]     = useState('');
    const [sending, setSending]     = useState(false);
    const [nonLus, setNonLus]       = useState(0);
    const [open, setOpen]           = useState(false);
    const bottomRef = useRef(null);

    const load = () => {
        axios.get(`/api/messagerie/dossier/${dossierId}`)
            .then(r => {
                setMessages(r.data.messages ?? []);
                setNonLus(0);
            })
            .catch(() => {});
    };

    const pollNonLus = () => {
        axios.get(`/api/messagerie/dossier/${dossierId}/nonlus`)
            .then(r => setNonLus(r.data.count ?? 0))
            .catch(() => {});
    };

    useEffect(() => {
        pollNonLus();
        const t = setInterval(pollNonLus, 20000);
        return () => clearInterval(t);
    }, [dossierId]);

    useEffect(() => {
        if (open) {
            load();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    const send = async () => {
        if (!contenu.trim()) return;
        setSending(true);
        try {
            await axios.post(`/api/messagerie/dossier/${dossierId}`, { contenu });
            setContenu('');
            load();
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Bouton flottant */}
            <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 1000 }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        width: 54, height: 54, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`,
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(12,68,124,0.4)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {nonLus > 0 && (
                        <span style={{
                            position: 'absolute', top: -3, right: -3,
                            minWidth: 18, height: 18, borderRadius: 99,
                            background: '#e11d48', color: '#fff', fontSize: 10, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 4px', border: '2px solid #fff',
                        }}>
                            {nonLus > 9 ? '9+' : nonLus}
                        </span>
                    )}
                </button>
            </div>

            {/* Panel de messagerie */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: 92, right: 28, zIndex: 999,
                    width: 360, height: 480,
                    background: '#fff', borderRadius: 18,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.16)',
                    border: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'msgSlide 0.2s ease',
                }}>
                    <style>{`@keyframes msgSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

                    {/* Header */}
                    <div style={{ padding: '14px 16px', background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Messagerie dossier</span>
                        </div>
                        <button onClick={() => setOpen(false)}
                            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {messages.length === 0
                            ? <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 40 }}>Aucun message pour l'instant</p>
                            : messages.map((m, i) => {
                                const meta = ROLE_LABEL[m.role] ?? { label: m.role, color: '#64748b', bg: '#f8fafc' };
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.est_moi ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                            {!m.est_moi && <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{m.auteur}</span>}
                                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: meta.bg, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                                            {m.est_moi && <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>Vous</span>}
                                        </div>
                                        <div style={{
                                            maxWidth: '82%', padding: '9px 12px', borderRadius: m.est_moi ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                            background: m.est_moi ? `${BLUE}` : '#f1f5f9',
                                            color: m.est_moi ? '#fff' : '#0f172a',
                                            fontSize: 13, lineHeight: 1.5,
                                        }}>
                                            {m.contenu}
                                        </div>
                                        <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{m.created_at}</span>
                                    </div>
                                );
                            })
                        }
                        <div ref={bottomRef}/>
                    </div>

                    {/* Input */}
                    <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, flexShrink: 0 }}>
                        <textarea
                            value={contenu}
                            onChange={e => setContenu(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                            placeholder="Écrire un message… (Entrée pour envoyer)"
                            rows={2}
                            style={{
                                flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 10px',
                                fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = BLUE}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <button onClick={send} disabled={sending || !contenu.trim()}
                            style={{
                                width: 38, height: 38, borderRadius: 10, alignSelf: 'flex-end',
                                background: contenu.trim() ? BLUE : '#e2e8f0',
                                border: 'none', cursor: contenu.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s', flexShrink: 0,
                            }}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={contenu.trim() ? '#fff' : '#94a3b8'} strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
