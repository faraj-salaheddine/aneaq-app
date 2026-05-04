import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

export default function Comites({ onboardings = [] }) {
    return (
        <>
            <Head title="Constitution du comité" />

            <DashboardShell
                title="Constitution du comité"
                subtitle="Workflow DEE"
            >
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm text-slate-600">
                                    <th className="px-6 py-4">Établissement</th>
                                    <th className="px-6 py-4">Dossier</th>
                                    <th className="px-6 py-4">Responsable</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {onboardings.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-100 text-sm">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{item.etablissement || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{item.dossier?.reference || '—'}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">{item.responsable_nom || '—'}</p>
                                            <p className="text-slate-500">{item.responsable_fonction || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            <p>{item.responsable_email || '—'}</p>
                                            <p>{item.responsable_telephone || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">{item.statut || '—'}</td>
                                        <td className="px-6 py-4">
                                            {item.dossier?.id ? (
                                                <Link
                                                    href={`/dee/dossiers/${item.dossier.id}`}
                                                    className="font-semibold text-blue-700 hover:text-blue-900"
                                                >
                                                    Ouvrir le dossier
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {onboardings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                                            Aucun comité n’a encore été renseigné.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardShell>
        </>
    );
}
