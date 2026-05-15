import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardShell from '@/Layouts/DashboardShell';

const BLUE  = '#0C447C';
const GREEN = '#1D9E75';

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const STATUT_COLOR = {
    visite_planifiee: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
    visite_realisee:  { bg: '#dcfce7', color: '#166534', dot: GREEN     },
    rapport_depose:   { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    rapport_valide:   { bg: '#d1fae5', color: '#064e3b', dot: GREEN     },
    en_cours:         { bg: '#ede9fe', color: '#4c1d95', dot: '#8b5cf6' },
};

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
    let d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Mon=0
}

export default function CalendrierVisites({ visites }) {
    const today = new Date();
    const [year, setYear]   = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selected, setSelected] = useState(null);

    const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

    const daysInMonth   = getDaysInMonth(year, month);
    const firstDay      = getFirstDayOfWeek(year, month);

    const visitesMap = {};
    visites.forEach(v => {
        if (!v.date_visite) return;
        const d = new Date(v.date_visite);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const key = d.getDate();
            if (!visitesMap[key]) visitesMap[key] = [];
            visitesMap[key].push(v);
        }
    });

    const upcomingVisites = visites
        .filter(v => v.date_visite && new Date(v.date_visite) >= new Date(today.toDateString()))
        .sort((a, b) => new Date(a.date_visite) - new Date(b.date_visite))
        .slice(0, 8);

    const selectedVisites = selected ? (visitesMap[selected] ?? []) : [];

    return (
        <DashboardShell title="Calendrier des visites">
            <Head title="Calendrier des visites"/>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>

                {/* Left: Calendar */}
                <div style={{ flex: '1 1 600px', minWidth: 320 }}>
                    <div style={{ marginBottom: 20 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: BLUE, margin: 0 }}>Calendrier des visites</h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>{visites.length} visite{visites.length !== 1 ? 's' : ''} planifiée{visites.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Calendar widget */}
                    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>

                        {/* Nav */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: `linear-gradient(135deg, ${BLUE}, #1a5fa8)`, color: '#fff' }}>
                            <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{MOIS[month]} {year}</span>
                            <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                        </div>

                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            {JOURS.map(j => (
                                <div key={j} style={{ textAlign: 'center', padding: '8px 4px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{j}</div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px' }}>
                            {/* Empty cells */}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}/>)}

                            {/* Day cells */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                const dayVisites = visitesMap[day] ?? [];
                                const hasVisite = dayVisites.length > 0;
                                const isSelected = selected === day;

                                return (
                                    <div
                                        key={day}
                                        onClick={() => setSelected(isSelected ? null : day)}
                                        style={{
                                            minHeight: 52, borderRadius: 10, padding: '6px 6px 4px',
                                            cursor: hasVisite ? 'pointer' : 'default',
                                            background: isSelected ? `${BLUE}12` : isToday ? '#fef9c3' : 'transparent',
                                            border: isSelected ? `1.5px solid ${BLUE}` : isToday ? '1.5px solid #fbbf24' : '1.5px solid transparent',
                                            transition: 'all 0.15s',
                                            position: 'relative',
                                        }}
                                    >
                                        <span style={{
                                            display: 'block', textAlign: 'center', fontSize: 13, fontWeight: isToday || isSelected ? 800 : 500,
                                            color: isToday ? '#92400e' : isSelected ? BLUE : '#334155',
                                            marginBottom: 3,
                                        }}>
                                            {day}
                                        </span>

                                        {hasVisite && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {dayVisites.slice(0, 2).map((v, vi) => {
                                                    const sc = STATUT_COLOR[v.statut] ?? { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
                                                    return (
                                                        <div key={vi} style={{
                                                            fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                                                            background: sc.bg, color: sc.color,
                                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        }}>
                                                            {v.etablissement}
                                                        </div>
                                                    );
                                                })}
                                                {dayVisites.length > 2 && (
                                                    <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>+{dayVisites.length - 2}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected day popup */}
                    {selected && selectedVisites.length > 0 && (
                        <div style={{ marginTop: 16, background: '#fff', borderRadius: 14, border: `1.5px solid ${BLUE}30`, padding: '14px 18px', boxShadow: '0 4px 16px rgba(12,68,124,0.1)' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: BLUE, marginBottom: 12 }}>
                                {selected} {MOIS[month]} {year} — {selectedVisites.length} visite{selectedVisites.length !== 1 ? 's' : ''}
                            </div>
                            {selectedVisites.map(v => {
                                const sc = STATUT_COLOR[v.statut] ?? { bg: '#f1f5f9', color: '#475569' };
                                return (
                                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{v.etablissement}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Réf: {v.reference} · {v.ville}</div>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, color: sc.color, background: sc.bg }}>
                                            {v.statut?.replace(/_/g, ' ')}
                                        </span>
                                        <Link href={`/dee/dossiers/${v.id}`} style={{ fontSize: 11, color: BLUE, fontWeight: 600, textDecoration: 'none' }}>
                                            Voir →
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: upcoming visites */}
                <div style={{ flex: '0 1 280px', minWidth: 240 }}>
                    <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 14, color: BLUE }}>Prochaines visites</div>
                    {upcomingVisites.length === 0 ? (
                        <div style={{ color: '#94a3b8', fontSize: 13, padding: '20px 0' }}>Aucune visite à venir</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {upcomingVisites.map(v => {
                                const sc = STATUT_COLOR[v.statut] ?? { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
                                const dt = new Date(v.date_visite);
                                const diffDays = Math.round((dt - new Date(today.toDateString())) / (1000*60*60*24));
                                return (
                                    <Link
                                        key={v.id}
                                        href={`/dee/dossiers/${v.id}`}
                                        style={{ textDecoration: 'none', display: 'block', padding: '12px 14px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }}/>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {v.etablissement}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                                            {dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, color: sc.color, background: sc.bg }}>
                                                {v.statut?.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: diffDays === 0 ? '#e11d48' : diffDays <= 7 ? '#f97316' : '#64748b' }}>
                                                {diffDays === 0 ? "Aujourd'hui" : diffDays === 1 ? 'Demain' : `J-${diffDays}`}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
