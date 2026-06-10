import { useEffect } from 'react';

const BLUE = '#0C447C';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
const PDF_EXTS   = ['pdf'];

function getExt(fileName) {
    return (fileName || '').split('.').pop().toLowerCase();
}

export default function PreviewModal({ url, fileName, onClose }) {
    const ext = getExt(fileName);
    const isImage = IMAGE_EXTS.includes(ext);
    const isPdf   = PDF_EXTS.includes(ext);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
            }}
        >
            {/* Header */}
            <div style={{
                width: '100%', maxWidth: 960,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 10,
            }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📄 {fileName}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a
                        href={url.replace('/voir', '/download')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: BLUE, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                    >
                        ⬇ Télécharger
                    </a>
                    <button
                        onClick={onClose}
                        style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{
                width: '100%', maxWidth: 960,
                flex: 1, maxHeight: 'calc(90vh - 80px)',
                background: '#1e293b', borderRadius: 12, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}>
                {isImage && (
                    <img
                        src={url}
                        alt={fileName}
                        style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 80px)', objectFit: 'contain', display: 'block' }}
                    />
                )}
                {isPdf && (
                    <iframe
                        src={url}
                        title={fileName}
                        style={{ width: '100%', height: 'calc(90vh - 80px)', border: 'none' }}
                    />
                )}
                {!isImage && !isPdf && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📎</div>
                        <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>
                            Prévisualisation non disponible
                        </p>
                        <p style={{ margin: '0 0 20px', fontSize: 13 }}>
                            Le format <strong style={{ color: '#fff' }}>.{ext}</strong> ne peut pas être affiché dans le navigateur.
                        </p>
                        <a
                            href={url.replace('/voir', '/download')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, background: BLUE, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                        >
                            ⬇ Télécharger le fichier
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
