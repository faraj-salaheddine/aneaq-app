import { Head, Link, useForm } from '@inertiajs/react';
import ExpertLayout from '@/Layouts/Expert/ExpertLayout';
import {
    ArrowLeft,
    Building2,
    LockKeyhole,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    User,
    UserRound,
} from 'lucide-react';

export default function Edit({ user = {}, expert = {} }) {
    const form = useForm({
        nom: expert.nom || '',
        prenom: expert.prenom || '',
        email: expert.email || user.email || '',
        telephone: expert.telephone || '',
        grade: expert.grade || '',
        specialite: expert.specialite || '',
        etablissement: expert.etablissement || '',
        ville: expert.ville || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.put('/expert/profil', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Modifier mon profil — Expert" />

            <div className="min-h-screen bg-[#f6f8fc] px-6 py-8 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
                                Profil expert
                            </p>

                            <h1 className="mt-3 text-4xl font-black text-slate-950">
                                Modifier mon compte
                            </h1>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                Gérez vos informations personnelles et professionnelles.
                            </p>
                        </div>

                        <Link
                            href="/expert/dashboard"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={18} />
                            Retour
                        </Link>
                    </div>

                    <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1d2b9f] via-[#2563eb] to-[#0891b2] p-8 text-white shadow-2xl shadow-blue-900/20">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-white backdrop-blur ring-1 ring-white/20">
                                    <UserRound size={42} strokeWidth={2.3} />
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
                                        Compte expert
                                    </p>

                                    <h2 className="mt-2 text-3xl font-black">
                                        {`${form.data.prenom} ${form.data.nom}`.trim() || 'Expert'}
                                    </h2>

                                    <p className="mt-2 text-sm font-semibold text-blue-50">
                                        {form.data.email || 'Email non renseigné'}
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-400/15 px-5 py-3 text-sm font-black text-emerald-50 backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                Expert évaluateur
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                icon={User}
                                title="Informations personnelles"
                                description="Nom, prénom, email et téléphone."
                                color="blue"
                            />

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <Input
                                    label="Nom"
                                    value={form.data.nom}
                                    onChange={(value) => form.setData('nom', value)}
                                    error={form.errors.nom}
                                    required
                                    icon={User}
                                    placeholder="Ex : Alaoui"
                                />

                                <Input
                                    label="Prénom"
                                    value={form.data.prenom}
                                    onChange={(value) => form.setData('prenom', value)}
                                    error={form.errors.prenom}
                                    icon={User}
                                    placeholder="Ex : Mohamed"
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(value) => form.setData('email', value)}
                                    error={form.errors.email}
                                    required
                                    icon={Mail}
                                    placeholder="Ex : expert@universite.ma"
                                />

                                <Input
                                    label="Téléphone"
                                    value={form.data.telephone}
                                    onChange={(value) => form.setData('telephone', value)}
                                    error={form.errors.telephone}
                                    icon={Phone}
                                    placeholder="Ex : +212 6 12 34 56 78"
                                />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                icon={ShieldCheck}
                                title="Informations professionnelles"
                                description="Grade, spécialité, établissement et ville."
                                color="emerald"
                            />

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <Input
                                    label="Grade"
                                    value={form.data.grade}
                                    onChange={(value) => form.setData('grade', value)}
                                    error={form.errors.grade}
                                    icon={ShieldCheck}
                                    placeholder="Ex : Professeur de l’enseignement supérieur"
                                />

                                <Input
                                    label="Spécialité"
                                    value={form.data.specialite}
                                    onChange={(value) => form.setData('specialite', value)}
                                    error={form.errors.specialite}
                                    icon={ShieldCheck}
                                    placeholder="Ex : Intelligence artificielle"
                                />

                                <Input
                                    label="Établissement"
                                    value={form.data.etablissement}
                                    onChange={(value) => form.setData('etablissement', value)}
                                    error={form.errors.etablissement}
                                    icon={Building2}
                                    placeholder="Ex : ENSA Rabat"
                                />

                                <Input
                                    label="Ville"
                                    value={form.data.ville}
                                    onChange={(value) => form.setData('ville', value)}
                                    error={form.errors.ville}
                                    icon={MapPin}
                                    placeholder="Ex : Rabat"
                                />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                icon={LockKeyhole}
                                title="Mot de passe"
                                description="Laissez vide si vous ne voulez pas changer le mot de passe."
                                color="amber"
                            />

                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <Input
                                    label="Nouveau mot de passe"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(value) => form.setData('password', value)}
                                    error={form.errors.password}
                                    icon={LockKeyhole}
                                    placeholder="Minimum 8 caractères"
                                />

                                <Input
                                    label="Confirmer le mot de passe"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(value) => form.setData('password_confirmation', value)}
                                    error={form.errors.password_confirmation}
                                    icon={LockKeyhole}
                                    placeholder="Retapez le même mot de passe"
                                />
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                            >
                                <Save size={18} />
                                {form.processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

function SectionHeader({ icon: Icon, title, description, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}>
                <Icon size={26} />
            </div>

            <div>
                <h2 className="text-2xl font-black text-slate-950">
                    {title}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    icon: Icon,
    placeholder = '',
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>

            <div className="relative">
                {Icon && (
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon size={18} />
                    </div>
                )}

                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 ${
                        Icon ? 'pl-12' : 'pl-4'
                    } pr-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100`}
                />
            </div>

            {error && (
                <p className="mt-2 text-sm font-bold text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

Edit.layout = (page) => <ExpertLayout>{page}</ExpertLayout>;