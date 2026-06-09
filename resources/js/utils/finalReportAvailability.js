export function parseVisitDate(raw) {
    if (!raw || raw === 'Non planifiée' || raw === '—') {
        return null;
    }

    if (raw instanceof Date) {
        return Number.isNaN(raw.getTime()) ? null : raw;
    }

    const value = String(raw).trim();
    const frMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

    if (frMatch) {
        const [, day, month, year] = frMatch;
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function visitIsCompleted(dossier) {
    const visitDate = parseVisitDate(dossier?.date_visite);

    if (!visitDate) {
        return false;
    }

    const endOfVisitDay = new Date(visitDate);
    endOfVisitDay.setHours(23, 59, 59, 999);

    return endOfVisitDay < new Date();
}

export function finalReportAvailableAt(dossier) {
    const visitDate = parseVisitDate(dossier?.date_visite);

    if (!visitDate) {
        return null;
    }

    const availableAt = new Date(visitDate);
    availableAt.setDate(availableAt.getDate() + 1);
    availableAt.setHours(0, 0, 0, 0);

    return availableAt;
}

export function canUploadFinalReport(dossier) {
    const availableAt = finalReportAvailableAt(dossier);

    return Boolean(availableAt && availableAt <= new Date());
}

export function finalReportAvailabilityText(dossier) {
    const availableAt = finalReportAvailableAt(dossier);

    if (!availableAt) {
        return "Disponible après planification de la visite.";
    }

    return `Disponible à partir du ${availableAt.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })}.`;
}
