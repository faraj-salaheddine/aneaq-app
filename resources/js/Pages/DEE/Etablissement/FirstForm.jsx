import { Head, Link, useForm } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

export default function FirstForm({ etablissement, dossier, form }) {
    const onboardingForm = useForm({
        adresse: form?.adresse || '',
        site_web: form?.site_web || '',
        telephone: form?.telephone || '',
        responsable_nom: form?.responsable_nom || '',
        responsable_fonction: form?.responsable_fonction || '',
        responsable_email: form?.responsable_email || '',
        responsable_telephone: form?.responsable_telephone || '',
    });

    return (
        <>
            <Head title="Premier formulaire établissement" />

            <DashboardShell
                title="Premier formulaire établissement"
                subtitle="Après connexion"
                action={
                    dossier?.id ? (
                        <Link
                            href={`/dee/dossiers/${dossier.id}`}
                            className="rounded-xl bg-[#223270] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b285a]"
                        >
                            Accéder au dossier
                        </Link>
                    ) : null
                }
            >
                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-black text-slate-900">Votre établissement</h2>
                        <div className="space-y-3 text-sm text-slate-700">
                            <p><strong>Nom :</strong> {etablissement?.nom || '—'}</p>
                            <p><strong>Email :</strong> {etablissement?.email || '—'}</p>
                            <p><strong>Ville :</strong> {etablissement?.ville || '—'}</p>
                            <p><strong>Université :</strong> {etablissement?.universite || '—'}</p>
                            <p><strong>Dossier :</strong> {dossier?.reference || '—'}</p>
                            <p><strong>Statut :</strong> {dossier?.statut || '—'}</p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                        <h2 className="mb-5 text-lg font-black text-slate-900">Informations factuelles et comité d’autoévaluation</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onboardingForm.post('/etablissement/premier-formulaire');
                            }}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-bold text-slate-700">Adresse</label>
                                <textarea
                                    rows={3}
                                    value={onboardingForm.data.adresse}
                                    onChange={(e) => onboardingForm.setData('adresse', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">Site web</label>
                                <input
                                    type="text"
                                    value={onboardingForm.data.site_web}
                                    onChange={(e) => onboardingForm.setData('site_web', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">Téléphone</label>
                                <input
                                    type="text"
                                    value={onboardingForm.data.telephone}
                                    onChange={(e) => onboardingForm.setData('telephone', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">Nom du responsable</label>
                                <input
                                    type="text"
                                    value={onboardingForm.data.responsable_nom}
                                    onChange={(e) => onboardingForm.setData('responsable_nom', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">Fonction</label>
                                <input
                                    type="text"
                                    value={onboardingForm.data.responsable_fonction}
                                    onChange={(e) => onboardingForm.setData('responsable_fonction', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">Email du responsable</label>
                                <input
                                    type="email"
                                    value={onboardingForm.data.responsable_email}
                                    onChange={(e) => onboardingForm.setData('responsable_email', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">Téléphone du responsable</label>
                                <input
                                    type="text"
                                    value={onboardingForm.data.responsable_telephone}
                                    onChange={(e) => onboardingForm.setData('responsable_telephone', e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={onboardingForm.processing}
                                    className="rounded-xl bg-[#223270] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1b285a] disabled:opacity-60"
                                >
                                    Enregistrer le formulaire
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardShell>
        </>
    );
}
