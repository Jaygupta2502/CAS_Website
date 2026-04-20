import { CASApplication, FORM_SECTIONS } from '@/types/cas';

export function getSectionCount(app: CASApplication, sectionId: string): number {
  switch (sectionId) {
    case 'personal': {
      const p = app.personalProfile;
      // Consider personal "filled" only when key required fields present
      return (p.applicantName && p.employeeId && p.school && p.department && p.currentDesignation && p.appliedForPost && p.dateOfBirth && p.email && p.mobile) ? 1 : 0;
    }
    case 'experience': return app.previousExperience.length;
    case 'administrative': return app.administrativeRoles.length;
    case 'teaching': return app.teachingWorkload.length;
    case 'fdp': return app.fdpEntries.length;
    case 'publications': return app.publications.length;
    case 'patents': return app.patents.length;
    case 'projects': return app.researchProjects.length;
    case 'phd': return app.phdScholars.length;
    default: return 0;
  }
}

export function getCompletion(app: CASApplication) {
  const filled = FORM_SECTIONS.filter(s => getSectionCount(app, s.id) > 0).length;
  return {
    filled,
    total: FORM_SECTIONS.length,
    percentage: Math.round((filled / FORM_SECTIONS.length) * 100),
    isComplete: filled === FORM_SECTIONS.length,
  };
}

// Auto-calculations
export function parseDMY(s: string): Date | null {
  if (!s || s === 'NA' || s === 'Currently Working' || s === 'Continuing') return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

export function yearsBetween(from: string, to: Date = new Date()): number {
  const start = parseDMY(from);
  if (!start) return 0;
  const ms = to.getTime() - start.getTime();
  return Math.max(0, Math.round((ms / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10);
}
