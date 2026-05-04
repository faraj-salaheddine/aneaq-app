import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Globe,
    LockKeyhole,
    LogOut,
    Mail,
    Save,
    ShieldCheck,
    Trash2,
    User,
    UserCircle2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DeeHeader from '@/Components/DEE/DeeHeader';

export default function Edit({ mustVerifyEmail, status }) {
    const { props } = usePage();
    const auth = props.auth || {};
    const locale = props.locale || 'fr';
    const isArabic = locale === 'ar';

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const profileForm = useForm({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const t = useMemo(() => {
        const fr = {
            about: 'À propos',
            universities: 'Universités',
            guides: 'Guides',
            arabic: 'العربية',
            french: 'Français',
            profile: 'Profil',
            logout: 'Se déconnecter',

            pageBadge: 'Gestion du profil',
            pageTitle: 'Mon profil utilisateur',
            pageDesc:
                'Consultez et mettez à jour les informations de votre compte administrateur depuis une interface claire, moderne et sécurisée.',

            account: 'Compte',
            name: 'Nom',
            email: 'Email',
            role: 'Rôle',
            admin: 'Administrateur DEE',

            personalInfo: 'Informations personnelles',
            personalDesc: 'Modifiez le nom et l’adresse email associés à votre compte.',

            security: 'Sécurité',
            passwordInfo: 'Sécurité du compte',
            passwordDesc: 'Mettez à jour votre mot de passe pour renforcer la sécurité.',
            currentPassword: 'Mot de passe actuel',
            newPassword: 'Nouveau mot de passe',
            confirmPassword: 'Confirmer le mot de passe',

            danger: 'Zone sensible',
            deleteInfo: 'Suppression du compte',
            deleteDesc:
                'Cette action est définitive. Une fois votre compte supprimé, toutes les données associées seront supprimées.',
            deletePassword: 'Confirmez avec votre mot de passe',
            deleteButton: 'Supprimer le compte',

            save: 'Enregistrer',
            updated: 'Mis à jour avec succès',
        };

        const ar = {
            about: 'حول المنصة',
            universities: 'الجامعات',
            guides: 'الأدلة',
            arabic: 'العربية',
            french: 'Français',
            profile: 'الملف الشخصي',
            logout: 'تسجيل الخروج',

            pageBadge: 'تدبير الملف الشخصي',
            pageTitle: 'ملفي الشخصي',
            pageDesc:
                'يمكنك تحديث معلومات حسابك الإداري من خلال واجهة واضحة وحديثة وآمنة.',

            account: 'الحساب',
            name: 'الاسم',
            email: 'البريد الإلكتروني',
            role: 'الدور',
            admin: 'مسؤول',

            personalInfo: 'المعلومات الشخصية',
            personalDesc: 'قم بتعديل الاسم والبريد الإلكتروني المرتبط بحسابك.',

            security: 'الأمان',
            passwordInfo: 'أمان الحساب',
            passwordDesc: 'قم بتحديث كلمة المرور لتعزيز حماية الحساب.',
            currentPassword: 'كلمة المرور الحالية',
            newPassword: 'كلمة المرور الجديدة',
            confirmPassword: 'تأكيد كلمة المرور',

            danger: 'منطقة حساسة',
            deleteInfo: 'حذف الحساب',
            deleteDesc:
                'هذه العملية نهائية. بعد حذف الحساب سيتم حذف البيانات المرتبطة به.',
            deletePassword: 'أكد بكلمة المرور',
            deleteButton: 'حذف الحساب',

            save: 'حفظ',
            updated: 'تم التحديث بنجاح',
        };

        return isArabic ? ar : fr;
    }, [isArabic]);

    const universities = [
        { name: 'Université Mohammed V – Rabat', link: 'http://www.um5.ac.ma/um5/' },
        { name: 'Université Hassan II – Casablanca', link: 'http://www.uh2c.ac.ma/' },
        { name: 'Université Cadi Ayyad – Marrakech', link: 'http://www.uca.ma' },
        { name: 'Université Sidi Mohammed Ben Abdellah – Fès', link: 'http://www.usmba.ac.ma/' },
        { name: 'Université Moulay Ismail – Meknès', link: 'http://www.umi.ac.ma' },
        { name: 'Université Abdelmalek Essaadi – Tétouan', link: 'http://www.uae.ma/' },
    ];

    const submitProfile = (e) => {
        e.preventDefault();

        profileForm.patch('/profile', {
            preserveScroll: true,
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();

        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset(
                    'current_password',
                    'password',
                    'password_confirmation'
                );
            },
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();

        if (!confirm('Voulez-vous vraiment supprimer ce compte ?')) {
            return;
        }

        deleteForm.delete('/profile', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Profil - ANEAQ" />

            <div
                dir={isArabic ? 'rtl' : 'ltr'}
                className="min-h-screen bg-[#f6f8fc] text-slate-800"
            >
                {/* HEADER */}
                <DeeHeader />

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* HERO */}
                    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2636c9] via-[#2673e8] to-[#0ea5c6] p-8 text-white shadow-2xl shadow-blue-900/20 md:p-10">
                        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.32em] text-blue-100">
                                    {t.pageBadge}
                                </p>

                                <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                                    {t.pageTitle}
                                </h1>

                                <p className="mt-5 max-w-3xl text-sm font-medium leading-8 text-blue-50/90">
                                    {t.pageDesc}
                                </p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <ProfileStat
                                    icon={UserCircle2}
                                    label={t.account}
                                    value={auth?.user?.name || '—'}
                                />

                                <ProfileStat
                                    icon={Mail}
                                    label={t.email}
                                    value={auth?.user?.email || '—'}
                                />

                                <ProfileStat
                                    icon={ShieldCheck}
                                    label={t.role}
                                    value={t.admin}
                                />
                            </div>
                        </div>
                    </section>

                    {/* CARDS */}
                    <section className="mt-8 grid gap-8">
                        {/* INFORMATIONS */}
                        <FormCard
                            icon={UserCircle2}
                            color="blue"
                            badge={t.personalInfo}
                            title={t.personalInfo}
                            desc={t.personalDesc}
                        >
                            <form onSubmit={submitProfile} className="space-y-6">
                                <div>
                                    <Label>{t.name}</Label>
                                    <Input
                                        value={profileForm.data.name}
                                        onChange={(e) =>
                                            profileForm.setData('name', e.target.value)
                                        }
                                        type="text"
                                    />
                                    <Error message={profileForm.errors.name} />
                                </div>

                                <div>
                                    <Label>{t.email}</Label>
                                    <Input
                                        value={profileForm.data.email}
                                        onChange={(e) =>
                                            profileForm.setData('email', e.target.value)
                                        }
                                        type="email"
                                    />
                                    <Error message={profileForm.errors.email} />
                                </div>

                                {mustVerifyEmail &&
                                    auth?.user?.email_verified_at === null && (
                                        <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-700">
                                            Votre adresse email n’est pas encore vérifiée.
                                        </div>
                                    )}

                                {status && (
                                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {t.save}
                                </button>
                            </form>
                        </FormCard>

                        {/* PASSWORD */}
                        <FormCard
                            icon={LockKeyhole}
                            color="emerald"
                            badge={t.security}
                            title={t.passwordInfo}
                            desc={t.passwordDesc}
                        >
                            <form onSubmit={submitPassword} className="space-y-6">
                                <div>
                                    <Label>{t.currentPassword}</Label>
                                    <Input
                                        value={passwordForm.data.current_password}
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                'current_password',
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                    />
                                    <Error message={passwordForm.errors.current_password} />
                                </div>

                                <div>
                                    <Label>{t.newPassword}</Label>
                                    <Input
                                        value={passwordForm.data.password}
                                        onChange={(e) =>
                                            passwordForm.setData('password', e.target.value)
                                        }
                                        type="password"
                                    />
                                    <Error message={passwordForm.errors.password} />
                                </div>

                                <div>
                                    <Label>{t.confirmPassword}</Label>
                                    <Input
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                'password_confirmation',
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                    />
                                    <Error
                                        message={
                                            passwordForm.errors.password_confirmation
                                        }
                                    />
                                </div>

                                {passwordForm.recentlySuccessful && (
                                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                                        {t.updated}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    <LockKeyhole size={18} />
                                    {t.save}
                                </button>
                            </form>
                        </FormCard>

                        {/* DELETE */}
                        <FormCard
                            icon={Trash2}
                            color="red"
                            badge={t.danger}
                            title={t.deleteInfo}
                            desc={t.deleteDesc}
                        >
                            <form onSubmit={submitDelete} className="space-y-6">
                                <div>
                                    <Label>{t.deletePassword}</Label>
                                    <Input
                                        value={deleteForm.data.password}
                                        onChange={(e) =>
                                            deleteForm.setData('password', e.target.value)
                                        }
                                        type="password"
                                    />
                                    <Error message={deleteForm.errors.password} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={deleteForm.processing}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Trash2 size={18} />
                                    {t.deleteButton}
                                </button>
                            </form>
                        </FormCard>
                    </section>
                </main>
            </div>
        </>
    );
}

function ProfileStat({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0 rounded-[1.5rem] bg-white/12 p-5 backdrop-blur">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Icon size={22} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-100">
                {label}
            </p>

            <p className="mt-3 break-words text-sm font-black leading-6 text-white">
                {value}
            </p>
        </div>
    );
}

function FormCard({ icon: Icon, color, badge, title, desc, children }) {
    const colors = {
        blue: {
            iconBg: 'bg-blue-50',
            iconText: 'text-blue-600',
            badge: 'text-blue-600',
            border: 'border-slate-200',
            bottomBorder: 'border-slate-100',
        },
        emerald: {
            iconBg: 'bg-emerald-50',
            iconText: 'text-emerald-600',
            badge: 'text-emerald-600',
            border: 'border-slate-200',
            bottomBorder: 'border-slate-100',
        },
        red: {
            iconBg: 'bg-red-50',
            iconText: 'text-red-600',
            badge: 'text-red-600',
            border: 'border-red-200',
            bottomBorder: 'border-red-100',
        },
    };

    const c = colors[color];

    return (
        <div
            className={`overflow-hidden rounded-[2rem] border ${c.border} bg-white shadow-sm`}
        >
            <div
                className={`flex flex-col gap-4 border-b ${c.bottomBorder} px-7 py-6 md:flex-row md:items-center md:justify-between`}
            >
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${c.iconBg} ${c.iconText}`}
                    >
                        <Icon size={26} />
                    </div>

                    <div>
                        <p
                            className={`text-xs font-black uppercase tracking-[0.28em] ${c.badge}`}
                        >
                            {badge}
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-blue-950">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">{desc}</p>
                    </div>
                </div>
            </div>

            <div className="p-7">{children}</div>
        </div>
    );
}

function Label({ children }) {
    return (
        <label className="mb-2 block text-sm font-bold text-slate-700">
            {children}
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
    );
}

function Error({ message }) {
    if (!message) return null;

    return <p className="mt-2 text-sm font-semibold text-red-600">{message}</p>;
}   