// ============================================================
//  Welcome.jsx — Page d'accueil publique du portail ANEAQ
//  Framework : Laravel Inertia.js + React + Tailwind CSS
//  Librairies : lucide-react (icônes), recharts (graphique)
// ============================================================

import { useState, useEffect } from 'react';
// useState  → gérer les états locaux (menu sticky, langue, modal…)
// useEffect → déclencher des effets de bord (scroll listener)

import { Link, Head, useForm } from '@inertiajs/react';
// Link     → navigation interne Inertia (remplace <a> classique sans rechargement de page)
// Head     → modifier le <title> et les <meta> de la page
// useForm  → gérer le formulaire de connexion (données, erreurs, envoi)

import { 
    Download,     // Icône téléchargement (boutons PDF)
    ExternalLink, // Icône lien externe (liste universités)
    ChevronDown,  // Icône flèche bas (dropdown universités)
    FileText,     // Icône document (cartes PDF)
    ShieldCheck,  // Icône bouclier (mission ANEAQ)
    Users,        // Icône utilisateurs (stat experts)
    BarChart3,    // Icône graphique (stat rapports)
    MapPin,       // Icône localisation (footer adresse)
    Phone,        // Icône téléphone (footer)
    Mail,         // Icône email (footer)
    Printer,      // Icône fax (footer)
    Globe,        // Icône globe (bouton langue)
    LogIn,        // Icône connexion (bouton navbar)
    X             // Icône fermeture (bouton fermer la modal)
} from 'lucide-react';

import { 
    BarChart,          // Conteneur principal du graphique à barres
    Bar,               // Une série de barres (publics ou privés)
    XAxis,             // Axe horizontal (années)
    YAxis,             // Axe vertical (nombre d'évaluations)
    CartesianGrid,     // Grille de fond du graphique
    Tooltip,           // Info-bulle au survol d'une barre
    ResponsiveContainer, // Wrapper qui adapte le graphique à la taille du parent
    Legend             // Légende (publics / privés)
} from 'recharts';


// ============================================================
//  COMPOSANT PRINCIPAL — exporté comme page Inertia
//  Props reçues depuis le contrôleur Laravel :
//    → auth : { user: null | {...} }  (utilisateur connecté ou non)
// ============================================================
export default function Welcome({ auth }) {

    // ----------------------------------------------------------
    //  ÉTATS LOCAUX (useState)
    // ----------------------------------------------------------

    // true quand l'utilisateur a scrollé > 50px → navbar devient blanche + ombre
    const [isSticky, setIsSticky] = useState(false);

    // Langue active : 'FR' (Français) ou 'AR' (Arabe)
    const [activeLang, setActiveLang] = useState('FR');

    // Décalage vertical du fond hero pour l'effet parallax (mis à jour au scroll)
    const [offsetY, setOffsetY] = useState(0);

    // Contrôle l'affichage de la modale de connexion
    const [showLoginModal, setShowLoginModal] = useState(false);


    // ----------------------------------------------------------
    //  GESTION DU FORMULAIRE DE CONNEXION (useForm Inertia)
    //  data      → valeurs des champs (email, password, remember)
    //  setData   → met à jour un champ précis
    //  post      → soumet le formulaire en POST vers une route Laravel
    //  processing → true pendant l'envoi (désactive le bouton)
    //  errors    → erreurs de validation renvoyées par Laravel
    //  reset     → réinitialise un ou plusieurs champs
    // ----------------------------------------------------------
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',      // Champ email (vide par défaut)
        password: '',   // Champ mot de passe (vide par défaut)
        remember: false // Case "Se souvenir de moi" (décochée par défaut)
    });

    // Handler de soumission du formulaire de connexion
    const submitLogin = (e) => {
        e.preventDefault(); // Empêche le rechargement natif de la page

        // Envoie les données vers la route Laravel nommée 'login'
        post(route('login'), {
            onSuccess: () => setShowLoginModal(false), // Ferme la modal si connexion réussie
            onError: () => reset('password'),          // Vide uniquement le mot de passe en cas d'erreur
        });
    };


    // ----------------------------------------------------------
    //  DICTIONNAIRE DE TRADUCTIONS (FR / AR)
    //  Chaque clé correspond à un texte affiché dans l'interface.
    //  On accède aux traductions via : t.nom_de_la_cle
    // ----------------------------------------------------------
    const translations = {
        FR: {
            // Navbar
            nav_about: "À propos",
            nav_universities: "Universités",
            nav_guides: "Guides",
            nav_login: "Se connecter",
            nav_dashboard: "Mon Tableau de Bord",

            // Section Hero
            hero_badge: "Assurance Qualité de l'Enseignement Supérieur",
            hero_title1: "Évaluer aujourd'hui pour",
            hero_title2: "l'excellence de demain",
            hero_desc: "Plateforme digitale centralisée dédiée à la gestion, au suivi et à l'orchestration des opérations d'évaluation institutionnelle au Maroc.",
            hero_btn1: "Ressources & Guides",
            hero_btn2: "Découvrir la DEE",

            // Section Statistiques
            stat_etab: "Établissements Évalués",
            stat_exp: "Experts Référencés",
            stat_rap: "Rapports Générés",
            stat_taux: "Taux de Conformité",

            // Graphique
            chart_title: "Évolution des évaluations par type d'établissement",
            public_etab: "Établissements Publics",
            prive_etab: "Établissements Privés",

            // Section À propos
            about_badge: "La Mission de l'ANEAQ",
            about_title: "Un pilier stratégique pour la Recherche Scientifique",
            about_desc: "La Division de l'Évaluation des Établissements (DEE) est investie d'une mission régalienne : accompagner les institutions publiques et privées vers les meilleurs standards internationaux à travers une démarche rigoureuse.",
            about_p1_title: "Évaluation Institutionnelle",
            about_p1_desc: "Analyse approfondie de la gouvernance, des infrastructures et de la pédagogie.",
            about_p2_title: "Digitalisation des Processus",
            about_p2_desc: "Espace unifié centralisant les rapports d'auto-évaluation et l'intervention des experts.",
            about_p3_title: "Suivi des Recommandations",
            about_p3_desc: "Traçabilité continue des plans d'action et des améliorations continues.",

            // Section Documents
            docs_badge: "Documentation",
            docs_title: "Centre de Ressources",
            docs_desc: "Accédez en libre téléchargement aux cadres de référence et canevas officiels pour la préparation de l'évaluation.",
            docs_card1: "Guide Auto-évaluation",
            docs_card2: "Référentiel Qualité",
            docs_card3: "Annexes & Formulaires",
            dl_fr: "Télécharger (FR)",
            dl_ar: "تحميل (AR)",

            // Footer
            footer_about: "Agence Nationale d'Évaluation et d'Assurance Qualité de l'Enseignement Supérieur et de la Recherche Scientifique.",
            footer_links: "Liens Rapides",
            footer_contact: "Contactez-nous",
            footer_rights: "© 2026 ANEAQ - Division de l'Évaluation des Établissements. Tous droits réservés.",

            // Modal de connexion
            login_title: "SE CONNECTER",
            login_email: "Adresse Email",
            login_pwd: "Mot de passe",
            login_forgot: "Mot de passe oublié ?",
            login_remember: "Se souvenir de moi",
            login_btn: "Se connecter",
            login_loading: "Connexion en cours...",
            login_robot: "Je ne suis pas un robot"
        },

        AR: {
            // Navbar
            nav_about: "حول الوكالة",
            nav_universities: "الجامعات",
            nav_guides: "الدلائل",
            nav_login: "تسجيل الدخول",
            nav_dashboard: "لوحة القيادة الخاصة بي",

            // Section Hero
            hero_badge: "ضمان جودة التعليم العالي",
            hero_title1: "تقييم اليوم من أجل",
            hero_title2: "تميز الغد",
            hero_desc: "منصة رقمية مركزية مخصصة لإدارة وتتبع وتنظيم عمليات التقييم المؤسساتي في المغرب.",
            hero_btn1: "الموارد والدلائل",
            hero_btn2: "اكتشف القسم",

            // Section Statistiques
            stat_etab: "المؤسسات المقيمة",
            stat_exp: "الخبراء المعتمدون",
            stat_rap: "التقارير المنجزة",
            stat_taux: "نسبة المطابقة",

            // Graphique
            chart_title: "تطور التقييمات حسب نوع المؤسسة",
            public_etab: "مؤسسات عامة",
            prive_etab: "مؤسسات خاصة",

            // Section À propos
            about_badge: "مهمة الوكالة",
            about_title: "ركيزة استراتيجية للبحث العلمي",
            about_desc: "تتولى قسم تقييم المؤسسات مهمة سيادية: مرافقة المؤسسات العامة والخاصة نحو أفضل المعايير الدولية من خلال نهج صارم.",
            about_p1_title: "التقييم المؤسساتي",
            about_p1_desc: "تحليل متعمق للحكامة والبنى التحتية والمنهجية التربوية.",
            about_p2_title: "رقمنة المساطر",
            about_p2_desc: "فضاء موحد يجمع تقارير التقييم الذاتي وتدخلات الخبراء.",
            about_p3_title: "تتبع التوصيات",
            about_p3_desc: "تتبع مستمر لخطط العمل والتحسينات المستمرة.",

            // Section Documents
            docs_badge: "الوثائق",
            docs_title: "مركز الموارد",
            docs_desc: "قم بتحميل الأطر المرجعية والنماذج الرسمية للتحضير للتقييم بحرية.",
            docs_card1: "دليل التقييم الذاتي",
            docs_card2: "المرجع الوطني للجودة",
            docs_card3: "الملاحق والنماذج",
            dl_fr: "Télécharger (FR)",
            dl_ar: "تحميل (AR)",

            // Footer
            footer_about: "الوكالة الوطنية لتقييم وضمان جودة التعليم العالي والبحث العلمي.",
            footer_links: "روابط سريعة",
            footer_contact: "اتصل بنا",
            footer_rights: "© 2026 الوكالة الوطنية لتقييم وضمان الجودة - قسم تقييم المؤسسات. جميع الحقوق محفوظة.",

            // Modal de connexion
            login_title: "تسجيل الدخول",
            login_email: "البريد الإلكتروني",
            login_pwd: "كلمة المرور",
            login_forgot: "هل نسيت كلمة المرور؟",
            login_remember: "تذكرني",
            login_btn: "دخول",
            login_loading: "جاري الاتصال...",
            login_robot: "أنا لست روبوت"
        }
    };

    // Raccourci : t.xxx → accède directement aux textes de la langue active
    const t = translations[activeLang];


    // ----------------------------------------------------------
    //  EFFET DE SCROLL — Parallax + Navbar sticky
    //  Déclenché une seule fois au montage du composant (tableau [] vide).
    //  Écoute l'événement 'scroll' sur window.
    //  Nettoyage : le listener est retiré quand le composant est démonté
    //              pour éviter les fuites mémoire.
    // ----------------------------------------------------------
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 50);    // Active la navbar sticky après 50px de scroll
            setOffsetY(window.scrollY * 0.4);    // Calcule le décalage parallax (40% de la position de scroll)
        };

        window.addEventListener('scroll', handleScroll); // Attache l'écouteur

        return () => window.removeEventListener('scroll', handleScroll); // Nettoyage au démontage
    }, []); // [] → s'exécute uniquement au premier rendu


    // ----------------------------------------------------------
    //  DONNÉES DU GRAPHIQUE (Recharts BarChart)
    //  Chaque objet = une année avec le nombre d'évaluations
    //  Les clés des séries utilisent t.public_etab / t.prive_etab
    //  pour s'adapter automatiquement à la langue active.
    // ----------------------------------------------------------
    const chartData = [
        { year: '2021', [t.public_etab]: 10, [t.prive_etab]: 3  },
        { year: '2022', [t.public_etab]: 9,  [t.prive_etab]: 3  },
        { year: '2023', [t.public_etab]: 0,  [t.prive_etab]: 0  },
        { year: '2024', [t.public_etab]: 21, [t.prive_etab]: 25 },
        { year: '2025', [t.public_etab]: 50, [t.prive_etab]: 0  },
    ];


    // ----------------------------------------------------------
    //  LISTE DES UNIVERSITÉS MAROCAINES
    //  Affichées dans le mega-menu dropdown de la navbar.
    //  name → nom affiché | link → URL du site officiel
    // ----------------------------------------------------------
    const universities = [
        { name: "Université Mohammed V – Rabat",                link: "http://www.um5.ac.ma/um5/"              },
        { name: "Université Hassan II – Casablanca",            link: "http://www.uh2c.ac.ma/"                 },
        { name: "Université Cadi Ayyad – Marrakech",           link: "http://www.uca.ma"                      },
        { name: "Université Sidi Mohammed Ben Abdellah – Fès", link: "http://www.usmba.ac.ma/"                },
        { name: "Université Al Quaraouiyine – Fès",            link: "http://www.uaq.ma"                      },
        { name: "Université Moulay Ismail – Meknès",           link: "http://www.umi.ac.ma"                   },
        { name: "Université Hassan Premier – Settat",          link: "http://www.uh1.ac.ma/"                  },
        { name: "Université Abdelmalek Essaadi – Tétouan",     link: "http://www.uae.ma/"                     },
        { name: "Université Ibn Zohr – Agadir",                link: "http://www.uiz.ac.ma"                   },
        { name: "Université Chouaïb Doukkali - El Jadida",     link: "http://www.ucd.ac.ma"                   },
        { name: "Université Mohammed Premier – Oujda",         link: "http://www.ump.ma/"                     },
        { name: "Université Ibn Tofail – Kénitra",             link: "http://www.univ-ibntofail.ac.ma"        },
        { name: "Université Sultan Moulay Slimane – Béni Mellal", link: "http://www.usms.ac.ma/"             },
        { name: "Université Al Akhawayn – Ifrane",             link: "http://www.aui.ma/en/"                  },
    ];


    // ----------------------------------------------------------
    //  LISTE DES DOCUMENTS TÉLÉCHARGEABLES (Section PDF)
    //  title → nom affiché sur la carte
    //  file  → nom du fichier dans /public/docs/ (FR) et /public/docs/ar_XXX (AR)
    // ----------------------------------------------------------
    const docs = [
        { title: t.docs_card1, file: "guide_auto.pdf"  },
        { title: t.docs_card2, file: "referentiel.pdf" },
        { title: t.docs_card3, file: "annexes.pdf"     },
    ];


    // ==========================================================
    //  RENDU JSX — Structure de la page
    // ==========================================================
    return (
        // Conteneur racine
        // dir="rtl" si langue arabe, sinon "ltr"
        // scroll-smooth → défilement fluide pour les ancres (#about, #download…)
        <div
            dir={activeLang === 'AR' ? 'rtl' : 'ltr'}
            className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth relative"
        >
            {/* Balise <title> de la page (injectée dans le <head> HTML via Inertia) */}
            <Head title="ANEAQ - Portail de l'Évaluation Institutionnelle" />


            {/* ====================================================
                SECTION 0 — NAVBAR (barre de navigation fixe)
                Comportement :
                  • Transparente + texte blanc quand en haut de page
                  • Blanche + ombre quand isSticky = true (scroll > 50px)
                z-40 → au-dessus de tout le contenu de page
            ==================================================== */}
            <nav className={`fixed w-full z-40 transition-all duration-500 ${
                isSticky ? 'bg-white shadow-xl py-3' : 'bg-transparent py-5 text-white'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

                    {/* Logo cliquable → retour à l'accueil (/) */}
                    <Link href="/" className="flex items-center gap-3 md:gap-5 group relative z-50">
                        {/* Logo du Ministère — caché si image introuvable */}
                        <img
                            src="/images/logo-ministere.png"
                            alt="Ministère"
                            className="h-10 sm:h-14 object-contain bg-white rounded-lg p-1.5 shadow-lg hover:scale-105 transition-transform"
                            onError={(e) => e.target.style.display='none'}
                        />
                        {/* Séparateur vertical entre les deux logos (visible ≥ sm) */}
                        <div className={`h-8 sm:h-12 w-px ${isSticky ? 'bg-slate-300' : 'bg-white/40'} hidden sm:block`}></div>
                        {/* Logo ANEAQ — fallback texte si image introuvable */}
                        <img
                            src="/images/logo-aneaq.png"
                            alt="ANEAQ"
                            className="h-10 sm:h-14 object-contain bg-white rounded-lg p-1.5 shadow-lg hover:scale-105 transition-transform"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.outerHTML = '<div class="bg-blue-600 p-2 rounded-xl"><ShieldCheck class="text-white w-6 h-6" /></div>';
                            }}
                        />
                    </Link>

                    {/* Liens de navigation (visibles uniquement ≥ lg) */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">

                        {/* Lien ancre → Section À propos */}
                        <a href="#about" className={`transition ${isSticky ? 'hover:text-blue-600 text-slate-700' : 'hover:text-blue-200 text-white drop-shadow-md'}`}>
                            {t.nav_about}
                        </a>

                        {/* Dropdown Universités
                            Visible au survol grâce à group + group-hover:block
                            Mega-menu en 2 colonnes listant toutes les universités */}
                        <div className="relative group cursor-pointer py-2">
                            <span className={`flex items-center gap-1 transition ${isSticky ? 'hover:text-blue-600 text-slate-700' : 'hover:text-blue-200 text-white drop-shadow-md'}`}>
                                {t.nav_universities} <ChevronDown size={16} />
                            </span>

                            {/* Panneau du dropdown — positionné en absolu sous le bouton
                                Alignement conditionnel : à droite en AR, à gauche en FR */}
                            <div className={`absolute hidden group-hover:block bg-white text-slate-800 shadow-2xl rounded-2xl p-5 w-[650px] top-full ${activeLang === 'AR' ? '-right-20' : '-left-20'} border border-slate-100`}>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                    {/* Itération sur la liste des universités */}
                                    {universities.map((u, i) => (
                                        <a
                                            key={i}
                                            href={u.link}
                                            target="_blank"        // Ouvre dans un nouvel onglet
                                            rel="noopener noreferrer" // Sécurité : empêche l'accès à window.opener
                                            className="flex items-center justify-between p-2.5 hover:bg-blue-50 rounded-xl text-sm transition font-medium border-b border-slate-50 last:border-0 hover:text-blue-700 group/link"
                                        >
                                            <span className="truncate pr-2">{u.name}</span>
                                            <ExternalLink size={14} className="text-blue-300 group-hover/link:text-blue-600 shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Lien ancre → Section téléchargements */}
                        <a href="#download" className={`transition ${isSticky ? 'hover:text-blue-600 text-slate-700' : 'hover:text-blue-200 text-white drop-shadow-md'}`}>
                            {t.nav_guides}
                        </a>
                    </div>

                    {/* Actions à droite : bouton langue + bouton connexion/dashboard */}
                    <div className="flex items-center gap-4">

                        {/* Bouton bascule de langue FR ↔ AR */}
                        <button
                            onClick={() => setActiveLang(activeLang === 'FR' ? 'AR' : 'FR')}
                            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition shadow-sm ${
                                isSticky
                                    ? 'border-slate-300 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                    : 'border-white text-white hover:bg-white hover:text-blue-950 drop-shadow-md'
                            }`}
                        >
                            <Globe size={16} />
                            {/* Affiche la langue cible (vers laquelle on va basculer) */}
                            {activeLang === 'FR' ? 'العربية' : 'Français'}
                        </button>

                        {/* Affichage conditionnel :
                            - Si l'utilisateur est connecté → bouton "Mon Tableau de Bord"
                            - Sinon → bouton "Se connecter" qui ouvre la modal */}
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                            >
                                {t.nav_dashboard}
                            </Link>
                        ) : (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                                    isSticky
                                        ? 'bg-blue-950 text-white hover:bg-blue-900'
                                        : 'bg-white text-blue-950 hover:bg-slate-100'
                                }`}
                            >
                                <LogIn size={18} /> {t.nav_login}
                            </button>
                        )}
                    </div>
                </div>
            </nav>


            {/* ====================================================
                SECTION 1 — HERO (Bannière principale)
                Structure :
                  • Image de fond avec effet parallax (translateY)
                  • Overlay sombre semi-transparent (backdrop-blur)
                  • Contenu centré : badge, titre, description, 2 boutons CTA
                pt-[9rem] → compense la hauteur de la navbar fixe
            ==================================================== */}
            <section className="relative pt-[9rem] pb-40 overflow-hidden min-h-[85vh] flex items-center bg-blue-950">

                {/* Image de fond — translateY animé avec offsetY pour l'effet parallax */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: "url('/images/Aneaq-espace3.png')",
                        transform: `translateY(${offsetY}px)`, // Décalage parallax calculé au scroll
                        willChange: 'transform'                 // Optimisation GPU pour l'animation
                    }}
                ></div>

                {/* Overlay de couleur bleu foncé + légère pixelisation (backdrop-blur)
                    Améliore la lisibilité du texte sur l'image de fond */}
                <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[3px] z-0"></div>

                {/* Contenu textuel au-dessus de l'overlay (z-10) */}
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10 w-full">

                    {/* Badge catégorie (pill) */}
                    <span className="inline-block px-5 py-2 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-sm shadow-xl">
                        {t.hero_badge}
                    </span>

                    {/* Titre principal H1 — hero_title2 en bleu clair pour l'accentuation */}
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-white drop-shadow-2xl">
                        {t.hero_title1} <br />
                        <span className="text-blue-300">{t.hero_title2}</span>
                    </h1>

                    {/* Description courte */}
                    <p className="text-lg md:text-xl text-blue-50 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-md">
                        {t.hero_desc}
                    </p>

                    {/* Boutons CTA (Call-To-Action)
                        → btn1 : ancre vers la section PDF (#download)
                        → btn2 : ancre vers la section À propos (#about) */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="#download"
                            className="bg-white text-blue-950 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 hover:scale-105"
                        >
                            {t.hero_btn1} <FileText size={20} />
                        </a>
                        <a
                            href="#about"
                            className="bg-blue-600/80 hover:bg-blue-600 text-white backdrop-blur-md px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 border border-white/20 hover:scale-105"
                        >
                            {t.hero_btn2}
                        </a>
                    </div>
                </div>
            </section>


            {/* ====================================================
                SECTION 2 — À PROPOS (Mission de l'ANEAQ)
                Layout : grille 2 colonnes sur desktop
                  → Gauche : logo ANEAQ en grand dans un cadre décoratif
                  → Droite : titre, description, 3 piliers (liste)
                id="about" → cible des liens de la navbar et du hero
            ==================================================== */}
            <section id="about" className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 md:gap-24 items-center">

                    {/* Colonne gauche — Logo ANEAQ
                        order-2 md:order-1 : sur mobile il s'affiche APRÈS le texte */}
                    <div className="relative order-2 md:order-1">
                        <div className="aspect-[4/3] bg-white rounded-[3rem] overflow-hidden flex items-center justify-center border-8 border-slate-50 shadow-2xl relative p-12 md:p-16">
                            <img
                                src="/images/logo-aneaq.png"
                                alt="Logo ANEAQ"
                                className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    // Fallback texte si l'image est introuvable
                                    e.target.outerHTML = '<div class="text-slate-300 font-bold text-2xl">Logo ANEAQ</div>';
                                }}
                            />
                        </div>
                    </div>

                    {/* Colonne droite — Texte descriptif
                        order-1 md:order-2 : sur mobile il s'affiche EN PREMIER */}
                    <div className="order-1 md:order-2">
                        {/* Sous-titre badge */}
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                            {t.about_badge}
                        </span>
                        {/* Titre de la section */}
                        <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-6 leading-tight">
                            {t.about_title}
                        </h2>
                        {/* Paragraphe de description */}
                        <p className="text-slate-600 text-lg leading-relaxed mb-10">
                            {t.about_desc}
                        </p>

                        {/* Liste des 3 piliers de la mission (générée dynamiquement) */}
                        <div className="space-y-8">
                            {[
                                { t: t.about_p1_title, d: t.about_p1_desc }, // Pilier 1
                                { t: t.about_p2_title, d: t.about_p2_desc }, // Pilier 2
                                { t: t.about_p3_title, d: t.about_p3_desc }, // Pilier 3
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    {/* Icône bouclier dans un carré arrondi */}
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    {/* Titre + description du pilier */}
                                    <div>
                                        <h4 className="font-bold text-blue-950 text-lg mb-1">{item.t}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ====================================================
                SECTION 3 — CENTRE DE RESSOURCES (Téléchargements PDF)
                Affiche 3 cartes de documents disponibles en FR et AR.
                Chaque carte pointe vers /public/docs/[fichier]
                id="download" → cible des liens de la navbar et du hero
            ==================================================== */}
            <section id="download" className="py-24 md:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">

                    {/* En-tête de section (badge + titre + description) */}
                    <div className="text-center mb-16 md:mb-20">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                            {t.docs_badge}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-6">
                            {t.docs_title}
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            {t.docs_desc}
                        </p>
                    </div>

                    {/* Grille de cartes — 1 col mobile, 2 col tablette, 3 col desktop */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {docs.map((doc, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col h-full"
                            >
                                {/* Icône de la carte — change de couleur au survol */}
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <FileText size={32} />
                                </div>

                                {/* Titre du document */}
                                <h3 className="text-2xl font-bold text-blue-950 mb-8 flex-grow">
                                    {doc.title}
                                </h3>

                                {/* Boutons de téléchargement — FR (foncé) et AR (clair) */}
                                <div className="flex flex-col gap-3 mt-auto">
                                    {/* Téléchargement version française */}
                                    <a
                                        href={`/docs/${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-blue-950 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-950/20 w-full"
                                    >
                                        <Download size={18} /> {t.dl_fr}
                                    </a>
                                    {/* Téléchargement version arabe (préfixe ar_ dans le nom du fichier) */}
                                    <a
                                        href={`/docs/ar_${doc.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-slate-100 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-200 transition w-full"
                                    >
                                        <Download size={18} /> {t.dl_ar}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ====================================================
                SECTION 4 — STATISTIQUES + GRAPHIQUE
                Layout : grille 3 colonnes sur desktop
                  → 1 col gauche  : 4 cartes de stats (chiffres clés)
                  → 2 col droite  : graphique à barres (Recharts)
                id="stats"
            ==================================================== */}
            <section id="stats" className="py-24 md:py-32 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-10">

                        {/* --- CARTES DE STATISTIQUES (colonne gauche) --- */}
                        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                            {/* Tableau des 4 statistiques clés
                                label → libellé affiché sous le chiffre
                                val   → valeur numérique affichée
                                icon  → composant Lucide
                                color → couleur du texte de l'icône
                                bg    → couleur de fond de l'icône */}
                            {[
                                { label: t.stat_etab, val: "100",  icon: <ShieldCheck size={28} />, color: "text-blue-600",   bg: "bg-blue-50"   },
                                { label: t.stat_exp,  val: "242+", icon: <Users size={28} />,       color: "text-indigo-600", bg: "bg-indigo-50" },
                                { label: t.stat_rap,  val: "450+", icon: <FileText size={28} />,    color: "text-emerald-600",bg: "bg-emerald-50"},
                                { label: t.stat_taux, val: "88%",  icon: <BarChart3 size={28} />,   color: "text-sky-600",    bg: "bg-sky-50"    },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-6 hover:scale-105 transition-transform duration-300"
                                >
                                    {/* Icône colorée dans un carré arrondi */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}>
                                        {s.icon}
                                    </div>
                                    {/* Valeur numérique + libellé */}
                                    <div>
                                        <div className="text-3xl font-black text-slate-800 mb-1">{s.val}</div>
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- GRAPHIQUE À BARRES (colonne droite, 2/3 de la grille) --- */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col">
                            {/* Titre du graphique */}
                            <h3 className="text-xl font-bold text-blue-950 mb-2 flex items-center gap-3">
                                <BarChart3 className="text-blue-600" /> {t.chart_title}
                            </h3>
                            {/* Sous-titre statique (non traduit) */}
                            <p className="text-sm text-slate-400 mb-8 px-8">
                                Répartition annuelle des missions d'évaluation
                            </p>

                            {/* Wrapper responsif : s'adapte à 100% de la largeur du parent */}
                            <div className="flex-grow w-full min-h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                        barGap={8} // Espace entre les 2 barres d'une même année
                                    >
                                        {/* Grille horizontale en pointillés, sans lignes verticales */}
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                                        {/* Axe X : les années (2021–2025), sans trait d'axe */}
                                        <XAxis
                                            dataKey="year"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                                            dy={15}
                                        />

                                        {/* Axe Y : valeurs numériques, sans trait d'axe */}
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />

                                        {/* Info-bulle au survol d'une barre */}
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{
                                                borderRadius: '1rem',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                                fontWeight: 'bold'
                                            }}
                                        />

                                        {/* Légende positionnée en haut, avec icônes rondes */}
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{
                                                paddingBottom: '20px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#475569'
                                            }}
                                        />

                                        {/* Série "Établissements Publics" — bleu */}
                                        <Bar
                                            dataKey={t.public_etab}
                                            fill="#2563eb"
                                            radius={[6, 6, 0, 0]} // Coins supérieurs arrondis
                                            animationDuration={1500}
                                        />

                                        {/* Série "Établissements Privés" — vert */}
                                        <Bar
                                            dataKey={t.prive_etab}
                                            fill="#10b981"
                                            radius={[6, 6, 0, 0]}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ====================================================
                SECTION 5 — FOOTER
                Structure :
                  • Grille 4 colonnes : logo+desc | liens | contact (2 col)
                  • Ligne de copyright en bas
                Fond bleu foncé, texte blanc/semi-transparent
            ==================================================== */}
            <footer className="bg-blue-950 text-white pt-20 md:pt-24 pb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 pb-16 border-b border-white/10">

                        {/* Colonne 1 — Logo + description de l'ANEAQ */}
                        <div className="lg:col-span-1">
                            <span className="text-3xl font-black tracking-tighter mb-6 block flex items-center gap-2">
                                <img
                                    src="/images/logo-aneaq.png"
                                    alt="ANEAQ"
                                    className="h-10 bg-white rounded p-1"
                                    onError={(e) => e.target.style.display='none'}
                                />
                                ANEAQ
                            </span>
                            <p className="text-blue-200/70 text-sm leading-relaxed">{t.footer_about}</p>
                        </div>

                        {/* Colonne 2 — Liens rapides (ancres internes + modal connexion) */}
                        <div>
                            <h4 className="font-bold mb-6 text-lg text-white">{t.footer_links}</h4>
                            <ul className="space-y-4 text-blue-200/70 text-sm font-medium">
                                <li><a href="#about"   className="hover:text-white transition">{t.nav_about}</a></li>
                                <li><a href="#download" className="hover:text-white transition">{t.nav_guides}</a></li>
                                {/* Bouton qui ouvre la modal de connexion */}
                                <li>
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="hover:text-white transition"
                                    >
                                        {t.nav_login}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Colonnes 3 & 4 — Coordonnées de contact (2 sous-colonnes internes) */}
                        <div className="lg:col-span-2">
                            <h4 className="font-bold mb-6 text-lg text-white">{t.footer_contact}</h4>
                            <div className="grid sm:grid-cols-2 gap-8">
                                {/* Adresse postale + email */}
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4 text-sm text-blue-200/70">
                                        <MapPin className="text-blue-400 shrink-0 mt-0.5" size={20} />
                                        <span className="leading-relaxed">
                                            05 Street Abou Inan Hassan,<br />Rabat – Morocco
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Mail className="text-blue-400 shrink-0" size={20} />
                                        <a href="mailto:contact@aneaq.ma" className="hover:text-white transition">
                                            contact@aneaq.ma
                                        </a>
                                    </div>
                                </div>
                                {/* Téléphone + Fax
                                    dir="ltr" sur les numéros pour éviter l'inversion en mode RTL */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Phone className="text-blue-400 shrink-0" size={20} />
                                        <span dir="ltr">+212 537 27 16 08</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-blue-200/70">
                                        <Printer className="text-blue-400 shrink-0" size={20} />
                                        <span dir="ltr">+212 537 27 16 07</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ligne de copyright */}
                    <div className="text-center text-xs font-semibold text-blue-200/40 uppercase tracking-wider">
                        <p>{t.footer_rights}</p>
                    </div>
                </div>
            </footer>


            {/* ====================================================
                SECTION 6 — MODAL DE CONNEXION (Pop-up)
                Affichée uniquement si showLoginModal === true
                Structure :
                  • Fond semi-transparent + blur (ferme la modal au clic)
                  • Panneau blanc centré avec le formulaire Inertia
                z-[100] → au-dessus de tout (navbar incluse)
            ==================================================== */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">

                    {/* Fond obscurci cliquable — ferme la modal */}
                    <div
                        className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowLoginModal(false)}
                    ></div>

                    {/* Panneau de la modal (au-dessus du fond : z-10 relatif à z-[100]) */}
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">

                        {/* Bouton ✕ pour fermer la modal (coin supérieur droit) */}
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>

                        {/* En-tête de la modal : logo + titre */}
                        <div className="text-center mb-8">
                            <img
                                src="/images/logo-aneaq.png"
                                alt="Logo"
                                className="h-16 mx-auto mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100"
                                onError={(e) => e.target.style.display='none'}
                            />
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {t.login_title}
                            </h2>
                        </div>

                        {/* Formulaire de connexion (géré par useForm d'Inertia) */}
                        <form onSubmit={submitLogin} className="space-y-5 text-left">

                            {/* Champ Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    {t.login_email}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`w-full px-4 py-3 rounded-xl border ${
                                        errors.email
                                            ? 'border-red-500 focus:ring-red-200'   // Bordure rouge si erreur
                                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                                    } focus:ring transition-all bg-slate-50 focus:bg-white`}
                                    placeholder="nom@exemple.com"
                                    autoFocus // Focus automatique à l'ouverture de la modal
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {/* Message d'erreur (renvoyé par Laravel) */}
                                {errors.email && (
                                    <p className="text-red-500 text-xs font-semibold mt-2">{errors.email}</p>
                                )}
                            </div>

                            {/* Champ Mot de passe */}
                            <div>
                                {/* En-tête avec le lien "Mot de passe oublié" à droite */}
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700">
                                        {t.login_pwd}
                                    </label>
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        {t.login_forgot}
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={`w-full px-4 py-3 rounded-xl border ${
                                        errors.password
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                                    } focus:ring transition-all bg-slate-50 focus:bg-white`}
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {/* Message d'erreur mot de passe */}
                                {errors.password && (
                                    <p className="text-red-500 text-xs font-semibold mt-2">{errors.password}</p>
                                )}
                            </div>

                            {/* Options supplémentaires : "Se souvenir de moi" + faux reCAPTCHA */}
                            <div className="flex flex-col gap-4">

                                {/* Case à cocher "Se souvenir de moi" */}
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-slate-600">
                                        {t.login_remember}
                                    </span>
                                </label>

                                {/* Widget reCAPTCHA visuel (non fonctionnel — à remplacer par la vraie lib Google)
                                    Affiche uniquement la case + logo pour l'apparence */}
                                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3 flex items-center gap-4 shadow-sm">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-slate-700 flex-grow">
                                        {t.login_robot}
                                    </span>
                                    {/* Logo officiel reCAPTCHA de Google */}
                                    <img
                                        src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                                        alt="reCAPTCHA"
                                        className="w-7"
                                    />
                                </div>
                            </div>

                            {/* Bouton de soumission
                                disabled et opacité réduite pendant l'envoi (processing = true)
                                Affiche un texte différent selon l'état de traitement */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 transition-all transform active:scale-[0.98] mt-2 ${
                                    processing && 'opacity-75 cursor-not-allowed'
                                }`}
                            >
                                {processing ? t.login_loading : t.login_btn}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div> // Fin du conteneur racine
    );
}
// ============================================================
//  FIN DU COMPOSANT Welcome
// ============================================================