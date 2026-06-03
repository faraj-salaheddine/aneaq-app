import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity,
    BarChart2,
    Bell,
    Building2,
    CalendarCheck,
    ChevronRight,
    ClipboardCheck,
    FileText,
    Home,
    LayoutDashboard,
    Layers3,
    LogOut,
    Users,
} from 'lucide-react';

const BLUE  = "#0f2d6e";
const ACCENT = "#2563eb";
const GREEN = "#1D9E75";

const NAV_GROUPS = [
    {
        group: 'Gestion',
        items: [
            { label: 'Tableau de bord',     href: '/dee/dashboard',              icon: LayoutDashboard, color: '#3b82f6' },
            { label: "Vagues d'évaluation", href: '/dee/campagnes',              icon: Layers3,         color: '#f59e0b' },
            { label: 'Établissements',      href: '/dee/etablissements',         icon: Building2,       color: '#ef9f27' },
            { label: 'Experts',             href: '/dee/experts',                icon: Users,           color: GREEN     },
            { label: 'Dossiers',            href: '/dee/dossiers',               icon: ClipboardCheck,  color: '#8b5cf6' },
            { label: 'Notifications',        href: '/dee/notifications',          icon: Bell,            color: '#e11d48' },
        ],
    },
    {
        group: 'Workflow',
        items: [
            { label: 'Affectations',    href: '/dee/workflow/affectations',  icon: Activity,      color: '#06b6d4' },
            { label: 'Visites',         href: '/dee/workflow/visites',       icon: CalendarCheck, color: '#ec4899' },
            { label: 'Comités',         href: '/dee/workflow/comites',       icon: BarChart2,     color: '#f97316' },
            { label: 'Recommandations', href: '/dee/workflow/recommandations', icon: FileText,    color: '#84cc16' },
            { label: 'Journal audit',   href: '/dee/audit',                  icon: FileText,      color: '#64748b' },
            { label: 'Suivi avancement',  href: '/dee/suivi-avancement',      icon: Activity,      color: '#10b981' },
            { label: 'Calendrier',       href: '/dee/calendrier-visites',    icon: CalendarCheck, color: '#ec4899' },
            { label: 'Q&R',              href: '/dee/questions-reponses',    icon: FileText,      color: '#f97316' },
        ],
    },
    {
        group: 'Paramétrage',
        items: [
            { label: 'Critères',         href: '/dee/criteres',              icon: ClipboardCheck, color: '#6366f1' },
        ],
    },
];

export default function DashboardShell({ children }) {
    const { url, props } = usePage();
    const user     = props?.auth?.user || null;
    const locale   = props?.locale || 'fr';
    const isArabic = locale === 'ar';

    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        const fetchCount = () => {
            axios.get('/api/notifications/count')
                .then(r => setNotifCount(r.data.count ?? 0))
                .catch(() => {});
        };
        fetchCount();
        const interval = setInterval(fetchCount, 10000);
        const unsubscribe = router.on('finish', fetchCount);
        return () => { clearInterval(interval); unsubscribe(); };
    }, []);

    const isActive = (href) => {
        if (href === '/dee/dashboard') return url === '/dee/dashboard';
        return url.startsWith(href);
    };

    const initials = (name) =>
        (name || 'AD').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .dee-layout * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
                .dee-layout { zoom: 0.9; }
                .dee-nav-link { transition: all 0.18s ease; }
                .dee-nav-link:hover { background: rgba(255,255,255,0.07) !important; }
                .dee-logout-btn { transition: all 0.18s ease; }
                .dee-logout-btn:hover { background: rgba(239,68,68,0.12) !important; color: #fca5a5 !important; }
                .dee-home-btn { transition: all 0.18s ease; }
                .dee-home-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
                @keyframes dee-slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
                .dee-nav-link { animation: dee-slideIn 0.2s ease both; }
                .dee-user-pill:hover { background: rgba(255,255,255,0.12) !important; }
                .dee-sidebar-nav { scrollbar-width: none; -ms-overflow-style: none; }
                .dee-sidebar-nav::-webkit-scrollbar { display: none; }
            `}</style>

            <div
                className="dee-layout"
                dir={isArabic ? 'rtl' : 'ltr'}
                style={{ display: 'flex', height: 'calc(100vh / 0.9)', overflow: 'hidden', background: '#f1f5f9', zoom: 0.9 }}
            >
                {/* ── Sidebar ── */}
                <aside style={{
                    width: 240,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    background: `linear-gradient(180deg, #07184a 0%, ${BLUE} 55%, #0a2d5e 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative blobs */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: 100, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', pointerEvents: 'none' }} />

                    {/* ── Brand ── */}
                    <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, color: '#fff', fontSize: 13, letterSpacing: '-0.02em',
                                boxShadow: '0 4px 12px rgba(37,99,235,0.45)',
                                flexShrink: 0,
                            }}>
                                DEE
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>ANEAQ</p>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', fontWeight: 500 }}>Plateforme d'évaluation</p>
                            </div>
                        </div>

                        {/* User pill */}
                        <div style={{ marginTop: 16 }}>
                            <div
                                className="dee-user-pill"
                                onClick={() => router.visit('/profile')}
                                style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.18s' }}
                            >
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, #1d4ed8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 11, color: '#fff' }}>
                                    {initials(user?.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user?.name || 'Administrateur DEE'}
                                    </p>
                                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '1px 0 0' }}>Accès administrateur</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} />
                                    <ChevronRight size={12} color="rgba(255,255,255,0.4)" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Nav ── */}
                    <nav className="dee-sidebar-nav" style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
                        {NAV_GROUPS.map(({ group, items }, gi) => (
                            <div key={group} style={{ marginBottom: gi < NAV_GROUPS.length - 1 ? 20 : 0 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8, marginTop: 0 }}>
                                    {group}
                                </p>

                                {items.map(({ label, href, icon: Icon, color }, i) => {
                                    const active = isActive(href);
                                    const showBadge = href === '/dee/notifications' && notifCount > 0;
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className="dee-nav-link"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '10px 12px', borderRadius: 10,
                                                textDecoration: 'none', marginBottom: 2,
                                                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                                                border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                                                animationDelay: `${(gi * 5 + i) * 0.04}s`,
                                                position: 'relative', overflow: 'hidden',
                                            }}
                                        >
                                            {active && (
                                                <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3, borderRadius: '0 3px 3px 0', background: color }} />
                                            )}

                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                                background: active ? `${color}25` : 'rgba(255,255,255,0.07)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.18s',
                                            }}>
                                                <Icon size={15} color={active ? color : 'rgba(255,255,255,0.55)'} />
                                            </div>

                                            <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.65)', flex: 1 }}>
                                                {label}
                                            </span>

                                            {showBadge && (
                                                <span style={{
                                                    minWidth: 20, height: 20, borderRadius: 999,
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    padding: '0 5px', background: '#e11d48', color: '#fff',
                                                    fontSize: 10, fontWeight: 800,
                                                }}>
                                                    {notifCount > 99 ? '99+' : notifCount}
                                                </span>
                                            )}

                                            {active && <ChevronRight size={13} color="rgba(255,255,255,0.4)" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* ── Bottom actions ── */}
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                            className="dee-home-btn"
                            onClick={() => router.visit('/')}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Home size={15} color="rgba(255,255,255,0.6)" />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Accueil</span>
                        </button>

                        <button
                            className="dee-logout-btn"
                            onClick={() => router.post('/logout')}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', color: 'rgba(252,165,165,0.8)' }}
                        >
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <LogOut size={15} color="rgba(252,165,165,0.8)" />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Déconnexion</span>
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <main style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </>
    );
}
