import { Link } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardBackButton({
    href = '/dashboard',
    label = 'Dashboard DEE',
    className = '',
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 ${className}`}
        >
            <LayoutDashboard size={18} />
            <span>{label}</span>
        </Link>
    );
}