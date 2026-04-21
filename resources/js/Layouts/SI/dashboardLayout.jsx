// resources/js/Layouts/SI/DashboardLayout.jsx

import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Star,
    Building2,
    GraduationCap,
    LogOut,
} from 'lucide-react';

const navItems = [
    {
        label: "Vue d'ensemble",
        href: '/si/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Utilisateurs DEE',
        href: '/si/utilisateurs-dee',
        icon: Users,
    },
    {
        label: 'Experts',
        href: '/si/experts',
        icon: Star,
    },
    {
        label: 'Établissements',
        href: '/si/etablissements',
        icon: Building2,
    },
    {
        label: 'Universités',
        href: '/si/universites',
        icon: GraduationCap,
    },
];

export default function DashboardLayout({ children }) {
    const { url } = usePage();

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-[#1b3a6b] text-white flex-shrink-0">

                {/* Logo / Brand */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                    <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center font-bold text-white text-sm">
                        A
                    </div>
                    <div className="leading-tight">
                        <p className="font-semibold text-sm">ANEAQ</p>
                        <p className="text-xs text-white/60">Système d'Information</p>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = url.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    isActive
                                        ? 'bg-white/20 text-white font-medium'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                                {/* Active dot indicator */}
                                {isActive && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-2 py-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}