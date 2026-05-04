import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

export default function Affectations({ dossiers = [] }) {
    return (
        <>
            <Head title="Affectation des dossiers" />

            <DashboardShell
                title="Affectation des dossiers"
                subtitle="Workflow DEE"
            >
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-sm text-slate-600">
                                    <th className="px-6 py-4">Référence</th>
                                    <th className="px-6 py-4">Dossier</th>
                                    <th className="px-6 py-4">Établissement</th>
                                    <th className="px-6 py-4">Experts affectés</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dossiers.map((dossier) => (
                                    <tr key={dossier.id} className="border-t border-slate-100 text-sm">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{dossier.reference}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.nom}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.etablissement || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.experts_count}</td>
                                        <td className="px-6 py-4 text-slate-700">{dossier.statut}</td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dee/dossiers/${dossier.id}`}
                                                className="font-semibold text-blue-700 hover:text-blue-900"
                                            >
                                                Gérer l’affectation
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {dossiers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                                            Aucun dossier à affecter.
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
