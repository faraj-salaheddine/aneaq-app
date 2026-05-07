import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    FileText,
    FolderOpen,
    History,
    Home,
    LayoutDashboard,
    LogOut,
    Mail,
    UserRound,
} from 'lucide-react';

export default function ExpertLayout({ children }) {
    const { auth } = usePage().props;

    const user = auth?.user || {};
    const currentPath = window.location.pathname;

    const navItems = [
        {
            label: "Vue d'ensemble",
            href: '/expert/dashboard',
            icon: LayoutDashboard,
        },
        {
            label: 'Mes invitations',
            href: '/expert/participations',
            icon: Mail,
        },
        {
            label: 'Dossiers affectés',
            href: '/expert/dossiers',
            icon: FolderOpen,
        },
        {
            label: 'Mes rapports',
            href: '/expert/rapports',
            icon: FileText,
        },
        {
            label: 'Notifications',
            href: '/expert/notifications',
            icon: Bell,
        },
        {
            label: 'Historique',
            href: '/expert/historique',
            icon: History,
        },
    ];

    const isActive = (href) => {
        if (href === '/expert/dashboard') {
            return currentPath === href;
        }

        return currentPath.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#f6f8fc]">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-hidden bg-gradient-to-b from-[#112b73] via-[#0f2d78] to-[#081b4f] text-white shadow-2xl lg:flex">
                <div className="flex h-full flex-col">
                    <div className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xs font-black shadow-lg shadow-blue-900/30">
                                EX
                            </div>

                            <div>
                                <h1 className="text-lg font-black leading-none">
                                    ANEAQ
                                </h1>

                                <p className="mt-1 text-xs font-semibold text-blue-200">
                                    Espace Expert
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/expert/profil/modifier"
                        className="mx-4 block rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur transition hover:bg-white/15"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/15">
                                <UserRound size={26} strokeWidth={2.4} />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-white">
                                    {user.name || 'Expert'}
                                </p>

                                <div className="mt-1.5 flex items-center gap-2">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                                    <p className="truncate text-xs font-bold text-emerald-200">
                                        Expert évaluateur
                                    </p>
                                </div>

                                <p className="mt-1 text-[11px] font-semibold text-blue-200/80">
                                    Modifier mon profil
                                </p>
                            </div>
                        </div>
                    </Link>

                    <nav className="mt-8 flex-1 px-4">
                        <p className="mb-3 px-2 text-[11px] font-black uppercase tracking-[0.25em] text-blue-300/80">
                            Navigation
                        </p>

                        <div className="space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                            active
                                                ? 'bg-white/15 text-white shadow-lg shadow-blue-950/20'
                                                : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                                                active
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/10 text-blue-100 group-hover:bg-white/15'
                                            }`}
                                        >
                                            <Icon size={18} />
                                        </span>

                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="relative p-4">
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

                        <div className="relative space-y-2">
                            <Link
                                href="/"
                                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-white/15 hover:text-white"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                                    <Home size={18} />
                                </span>
                                Accueil
                            </Link>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-3 rounded-2xl bg-red-500/15 px-4 py-3 text-left text-sm font-bold text-red-100 transition hover:bg-red-500/25 hover:text-white"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20">
                                    <LogOut size={18} />
                                </span>
                                Déconnexion
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-64">
                <main>{children}</main>
            </div>
        </div>
    );
}