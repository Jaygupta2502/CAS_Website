import { Button } from '@/components/ui/button';
import API from "@/config/api";
import { CASApplication, EligibilityMetric } from '@/types/cas';
import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function computeEligibility(app: CASApplication): EligibilityMetric[] {
  const pubs = app.publications;
  const sciCount = pubs.filter(p => p.indexing === 'SCI' || p.indexing === 'SCIE').length;
  const scopusCount = pubs.filter(p => p.indexing === 'Scopus').length;
  const q1Count = pubs.filter(p => p.quartile === 'Q1').length;
  const ugcCareCount = pubs.filter(p => p.indexing === 'UGC-CARE').length;
  const fdpGe2 = app.fdpEntries.filter(f => f.durationWeeks >= 2).length;
  const patentsPubGranted = app.patents.filter(p => p.status === 'Published' || p.status === 'Granted').length;
  const projectsPI = app.researchProjects.filter(p => p.role === 'PI').length;
  const totalFunding = app.researchProjects.reduce((sum, p) => {
    const num = parseInt(p.fundingAmount.replace(/[^0-9]/g, '')) || 0;
    return sum + num;
  }, 0);
  const phdAwarded = app.phdScholars.filter(s => s.status === 'Awarded').length;

  const metrics: EligibilityMetric[] = [
    { sno: 1, metric: 'Total Teaching Experience (years)', yourValue: app.personalProfile.totalTeachingExperience, ugcMinimum: 4, status: app.personalProfile.totalTeachingExperience >= 4 ? 'MEETS' : 'SHORT', sourceSheet: 'Personal Profile' },
    { sno: 2, metric: 'Number of Previous Institutions', yourValue: app.previousExperience.length, ugcMinimum: 0, status: 'MEETS', sourceSheet: 'Previous Experience' },
    { sno: 3, metric: 'Cumulative Years of Experience', yourValue: app.personalProfile.totalTeachingExperience, ugcMinimum: 4, status: app.personalProfile.totalTeachingExperience >= 4 ? 'MEETS' : 'SHORT', sourceSheet: 'Previous Experience' },
    { sno: 4, metric: 'Total FDPs/STTPs/MOOCs', yourValue: app.fdpEntries.length, ugcMinimum: 2, status: app.fdpEntries.length >= 2 ? 'MEETS' : 'SHORT', sourceSheet: 'FDP' },
    { sno: 5, metric: 'FDPs of ≥2 weeks', yourValue: fdpGe2, ugcMinimum: 2, status: fdpGe2 >= 2 ? 'MEETS' : 'SHORT', sourceSheet: 'FDP' },
    { sno: 6, metric: 'Total Publications', yourValue: pubs.length, ugcMinimum: 5, status: pubs.length >= 5 ? 'MEETS' : 'SHORT', sourceSheet: 'Publications' },
    { sno: 7, metric: 'SCI/SCIE Publications', yourValue: sciCount, ugcMinimum: 1, status: sciCount >= 1 ? 'MEETS' : 'SHORT', sourceSheet: 'Publications' },
    { sno: 8, metric: 'Scopus Publications', yourValue: scopusCount, ugcMinimum: 3, status: scopusCount >= 3 ? 'MEETS' : 'SHORT', sourceSheet: 'Publications' },
    { sno: 9, metric: 'Q1 Publications', yourValue: q1Count, ugcMinimum: 1, status: q1Count >= 1 ? 'MEETS' : 'SHORT', sourceSheet: 'Publications' },
    { sno: 10, metric: 'UGC-CARE Publications', yourValue: ugcCareCount, ugcMinimum: 1, status: ugcCareCount >= 1 ? 'MEETS' : 'SHORT', sourceSheet: 'Publications' },
    { sno: 11, metric: 'Patents Filed', yourValue: app.patents.length, ugcMinimum: 0, status: 'MEETS', sourceSheet: 'Patents' },
    { sno: 12, metric: 'Patents Published / Granted', yourValue: patentsPubGranted, ugcMinimum: 0, status: 'MEETS', sourceSheet: 'Patents' },
    { sno: 13, metric: 'Funded Projects (count)', yourValue: app.researchProjects.length, ugcMinimum: 1, status: app.researchProjects.length >= 1 ? 'MEETS' : 'SHORT', sourceSheet: 'Projects' },
    { sno: 14, metric: 'Funded Projects as PI', yourValue: projectsPI, ugcMinimum: 0, status: 'MEETS', sourceSheet: 'Projects' },
    { sno: 15, metric: 'Total Project Funding (INR)', yourValue: `₹${totalFunding.toLocaleString('en-IN')}`, ugcMinimum: '₹1,00,000', status: totalFunding >= 100000 ? 'MEETS' : 'SHORT', sourceSheet: 'Projects' },
    { sno: 16, metric: 'PhD Scholars (Total)', yourValue: app.phdScholars.length, ugcMinimum: 0, status: 'MEETS', sourceSheet: 'PhD' },
    { sno: 17, metric: 'PhD Awarded', yourValue: phdAwarded, ugcMinimum: 0, status: 'MEETS', sourceSheet: 'PhD' },
    { sno: 18, metric: 'Administrative Roles', yourValue: app.administrativeRoles.length, ugcMinimum: 1, status: app.administrativeRoles.length >= 1 ? 'MEETS' : 'SHORT', sourceSheet: 'Administrative' },
  ];
  return metrics;
}

export default function ReportView() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { appId } = useParams();
  const [appData, setAppData] = useState<any>(null);
  const eligibility = useMemo(() => appData ? computeEligibility(appData) : [], [appData]);
const overallEligible = eligibility.every(e => e.status === 'MEETS');
const p = appData?.personalProfile;

  useEffect(() => {
  if (!appId) return;

  const token = localStorage.getItem("token");

  fetch(`${API}/api/applications/${appId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("REPORT DATA:", data); // 🔥 DEBUG
      setAppData(data);
    })
    .catch(err => {
      console.error("FETCH ERROR:", err);
    });
}, [appId]);

  const handlePrint = () => window.print();

  if (!appData) return <div className="p-8">Loading...</div>;

if (appData.error) {
  return <div className="p-8 text-red-500">{appData.error}</div>;
}

  const totalTheory = appData.teachingWorkload.reduce((s, t) => s + t.theoryHrs, 0);
  const totalPrac = appData.teachingWorkload.reduce((s, t) => s + t.practicalHrs, 0);
  const totalTut = appData.teachingWorkload.reduce((s, t) => s + t.tutorialHrs, 0);
  const totalPatentsFiled = appData.patents.length;
  const totalPatentsPub = appData.patents.filter(x => x.status === 'Published').length;
  const totalPatentsGranted = appData.patents.filter(x => x.status === 'Granted').length;
  const totalProjects = appData.researchProjects.length;
  const totalFundingStr = `₹${appData.researchProjects.reduce((s, p) => s + (parseInt(p.fundingAmount.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString('en-IN')}`;
  const projectsPI = appData.researchProjects.filter(x => x.role === 'PI').length;
  const totalScholars = appData.phdScholars.length;
  const phdAwarded = appData.phdScholars.filter(s => s.status === 'Awarded').length;
  const phdOngoing = appData.phdScholars.filter(s => s.status === 'Ongoing').length;

  return (
    <div className="min-h-screen bg-muted">
      {/* Control bar */}
      <div className="no-print sticky top-0 z-50 bg-card border-b shadow-card">
        <div className="max-w-[900px] mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-[900px] mx-auto my-8 bg-card shadow-elevated print:shadow-none print:my-0">
        {/* Cover Page */}
        <div className="p-12 text-center border-b-4 border-primary">
          <p className="text-sm text-muted-foreground tracking-widest uppercase mb-2">MIT Art, Design and Technology University, Pune</p>
          <p className="text-xs text-muted-foreground mb-8">Career Advancement Scheme (CAS) — Application Report | AY 2025-26 w.e.f. 2026-27</p>
          <h1 className="text-2xl font-bold text-foreground mb-1">MIT ART, DESIGN AND TECHNOLOGY UNIVERSITY</h1>
          <p className="text-muted-foreground mb-1">PUNE, INDIA</p>
          <h2 className="text-xl font-bold text-accent mt-6 mb-1">CAREER ADVANCEMENT SCHEME (CAS)</h2>
          <h3 className="text-lg font-semibold text-foreground mb-8">APPLICATION REPORT</h3>
          <p className="text-sm text-muted-foreground mb-8">Academic Year 2025-26 (w.e.f. 2026-27)</p>

          <ReportTable rows={[
            ['Applicant Name', p.applicantName],
            ['Employee ID', p.employeeId],
            ['School / Department', `${p.school} / ${p.department}`],
            ['Current Designation', p.currentDesignation],
            ['Applied for Post of', p.appliedForPost],
            ['Date of Submission', appData.submissionDate || '—'],
          ]} />

          <div className="mt-8 text-left text-sm text-muted-foreground">
            <p>Submitted to:</p>
            <p className="font-semibold text-foreground">The Hon'ble Vice Chancellor</p>
            <p>MIT Art, Design and Technology University, Pune</p>
            <p className="italic">Through: Head of Department → Dean, School of Computing → Registrar</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <ReportSection title="1. Executive Summary" printBreak>
          <p className="text-sm text-foreground leading-relaxed mb-6">
            This report consolidates the application of <b>{p.applicantName}</b> (<b>{p.employeeId}</b>) of <b>{p.school} / {p.department}</b> for
            promotion under the Career Advancement Scheme from <b>{p.currentDesignation}</b> to <b>{p.appliedForPost}</b>. Quantitative claims are
            auto-computed from the source workbook. Each claim references a proof document submitted with the application.
          </p>

          <h4 className="font-semibold text-sm text-foreground mb-3">1.1 Applicant Snapshot</h4>
          <ReportTable rows={[
            ['Name', p.applicantName],
            ['Employee ID', p.employeeId],
            ['School', p.school],
            ['Department', p.department],
            ['Current Designation', p.currentDesignation],
            ['Applied for', p.appliedForPost],
            ['Date of Birth', p.dateOfBirth],
            ['PhD awarded', p.phdCompletionDate],
            ['Total Teaching Exp.', `${p.totalTeachingExperience} years`],
            ['Post-PG Exp.', `${p.postPGExperience} years`],
            ['h-Index', String(p.hIndex)],
            ['i10-Index', String(p.i10Index)],
            ['Google Scholar Citations', String(p.googleScholarCitations)],
          ]} />
        </ReportSection>


        {/* 2. Personal Profile */}
        <ReportSection title="2. Personal Profile" printBreak>
          <p className="text-xs text-muted-foreground mb-4">All fields below are extracted directly from Sheet 1 (Personal Profile) of the source workbook.</p>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-gray-200 font-semibold"><th className="border p-2">#</th><th className="border p-2 text-left">Particulars</th><th className="border p-2 text-left">Value</th><th className="border p-2 text-left">Proof / Remark</th></tr></thead>
            <tbody>
              {[
                [1, 'Employee ID', p.employeeId, '—'],
                [2, 'Name of Institute', p.instituteName, '—'],
                [3, 'Name of Applicant', p.applicantName, '—'],
                [4, 'School', p.school, '—'],
                [5, 'Department', p.department, '—'],            
                [6, 'Current Designation', p.currentDesignation, p.proofCurrentDesignation],
                [8, 'Date of Birth', p.dateOfBirth, p.proofDateOfBirth],
                [10, 'UG Degree Completion', p.ugCompletionDate, p.proofUG],
                [11, 'PG Degree Completion', p.pgCompletionDate, p.proofPG],
                [12, 'SET/NET/JRF', p.setNetDate, p.proofSetNet],
                [13, 'PhD Completion', p.phdCompletionDate, p.proofPhD],
                [14, 'Post-Doc', p.postDocDate, p.proofPostDoc],
                [15, 'Joining Date (Asst Prof)', p.joiningDateAssistantProf, p.proofJoinAsst],
                [16, 'Joining Date (Assoc Prof)', p.joiningDateAssociateProf, p.proofJoinAssoc],
                [17, 'Joining Date in MAEER', p.joiningDateMAEER, p.proofJoinMAEER],
                [18, 'Joining Date in MIT-ADT', p.joiningDateMITADT, p.proofJoinMITADT],
                [21, 'Google Scholar URL', p.googleScholarUrl, p.proofGoogleScholar],
                [22, 'Citations', String(p.googleScholarCitations), p.proofCitations],
                [23, 'h-Index', String(p.hIndex), p.proofHIndex],
                [24, 'i10-Index', String(p.i10Index), p.proofI10],
                [25, 'Vidwan ID', p.vidwanId, p.proofVidwan],
                [26, 'Scopus Author ID', p.scopusAuthorId, p.proofScopus],
                [27, 'ORCID ID', p.orcidId, p.proofOrcid],
                [28, 'Publons / WoS ID', p.publonsId, p.proofPublons],
                [29, 'Email', p.email, '—'],
                [30, 'Mobile', p.mobile, '—'],
              ].map(([sno, label, val, proof]) => (
                <tr key={sno}><td className="border p-2 text-center">{sno}</td><td className="border p-2">{label}</td><td className="border p-2 font-medium">{val || '—'}</td><td className="border p-2 text-muted-foreground">
  {proof && typeof proof === 'string' && proof.startsWith('http') ? (
    <a
      href={proof}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      View
    </a>
  ) : (
    proof || '—'
  )}
</td></tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        {/* 3. Previous Experience */}
        <ReportSection title="3. Previous Institutional Experience" printBreak>
          <p className="text-xs text-muted-foreground mb-3">
            Total previous institutions: <b>{appData.previousExperience.length}</b> | Cumulative years: <b>{appData.previousExperience.reduce((s, e) => s + e.years, 0).toFixed(1)}</b>
          </p>
          <DataTable
            headers={['#', 'Institution', 'City', 'Designation', 'From', 'To', 'Years', 'Proof']}
            rows={appData.previousExperience.map((e, i) => [i + 1, e.institution, e.city, e.designation, e.joiningDate, e.relievingDate, e.years.toFixed(1), e.proofLink ])}
          />
        </ReportSection>

        {/* 4. Administrative */}
        <ReportSection title="4. Administrative Profile & Institutional Contribution" printBreak>
          <p className="text-xs text-muted-foreground mb-3">Total administrative responsibilities: {appData.administrativeRoles.length}</p>
          <DataTable
            headers={['#', 'Role', 'Level', 'From', 'To', 'Outcome', 'Proof']}
            rows={appData.administrativeRoles.map((r, i) => [i + 1, r.role, r.level, r.fromDate, r.toDate, r.outcome, r.proofLink ? 'Link' : '—'])}
          />
        </ReportSection>

        {/* 5. Teaching Workload */}
        <ReportSection title="5. Teaching Workload — AY 2025-26" printBreak>
          <p className="text-xs text-muted-foreground mb-3">
            Total Theory: <b>{totalTheory} hrs/wk</b> | Total Practical: <b>{totalPrac} hrs/wk</b> | Total Tutorial: <b>{totalTut} hrs/wk</b>
          </p>
          <DataTable
            headers={['#', 'Sem', 'Code', 'Course', 'Programme', 'Theory', 'Prac', 'Tut']}
            rows={appData.teachingWorkload.map((t, i) => [i + 1, t.semester, t.courseCode, t.courseName, t.programme, t.theoryHrs, t.practicalHrs, t.tutorialHrs])}
          />
        </ReportSection>

        {/* 6. FDP */}
        <ReportSection title="6. Faculty Development Programmes (FDP / STTP / MOOC)" printBreak>
          <p className="text-xs text-muted-foreground mb-3">
            Total programmes: <b>{appData.fdpEntries.length}</b> | ≥2 weeks: <b>{appData.fdpEntries.filter(f => f.durationWeeks >= 2).length}</b>
          </p>
          <DataTable
            headers={['#', 'Title', 'Type', 'Wks', 'From', 'To', 'Mode', 'Organiser', 'Cert']}
            rows={appData.fdpEntries.map((f, i) => [i + 1, f.title, f.type, f.durationWeeks, f.fromDate, f.toDate, f.mode, f.organiser, f.certificateNo])}
          />
        </ReportSection>

        {/* 7. Publications */}
        <ReportSection title="7. Research Publications" printBreak>
          <h4 className="font-semibold text-xs mb-3">7.1 Publication Counts</h4>
          <ReportTable rows={[
            ['Total Publications', String(appData.publications.length)],
            ['SCI / SCIE Indexed', String(appData.publications.filter(x => x.indexing === 'SCI' || x.indexing === 'SCIE').length)],
            ['Scopus Indexed', String(appData.publications.filter(x => x.indexing === 'Scopus').length)],
            ['Q1 Publications', String(appData.publications.filter(x => x.quartile === 'Q1').length)],
            ['UGC-CARE Listed', String(appData.publications.filter(x => x.indexing === 'UGC-CARE').length)],
          ]} />
          <h4 className="font-semibold text-xs mt-6 mb-3">7.2 Publication Details</h4>
          <DataTable
            headers={['#', 'Title', 'Venue', 'Type', 'Index', 'Q', 'DOI', 'M-Yr', 'Auth', 'IF']}
            rows={appData.publications.map((pub, i) => [i + 1, pub.title, pub.venue, pub.type, pub.indexing, pub.quartile, pub.doi, pub.monthYear, pub.authorship, pub.impactFactor])}
          />
        </ReportSection>

        {/* 8. Patents */}
        <ReportSection title="8. Patents" printBreak>
          <p className="text-xs text-muted-foreground mb-3">
            Total filed: <b>{totalPatentsFiled}</b> | Published: <b>{totalPatentsPub}</b> | Granted: <b>{totalPatentsGranted || '—'}</b>
          </p>
          <DataTable
            headers={['#', 'Title', 'App No.', 'Filed', 'Status', 'Pub/Grant Date', 'Country', 'Pos']}
            rows={appData.patents.map((pat, i) => [i + 1, pat.title, pat.applicationNo, pat.filingDate, pat.status, pat.pubGrantDate, pat.country, pat.inventorPosition])}
          />
        </ReportSection>

        {/* 9. Projects */}
        <ReportSection title="9. Research Projects & Consultancy" printBreak>
          <p className="text-xs text-muted-foreground mb-3">
            Total projects: <b>{totalProjects}</b> | Total funding: <b>{totalFundingStr}</b> | As PI: <b>{projectsPI}</b>
          </p>
          <DataTable
            headers={['#', 'Title', 'Agency', 'Type', 'Funding', 'Role', 'Start', 'End', 'Status']}
            rows={appData.researchProjects.map((proj, i) => [i + 1, proj.title, proj.agency, proj.type, proj.fundingAmount, proj.role, proj.startDate, proj.endDate, proj.status])}
          />
        </ReportSection>

        {/* 10. PhD Supervision */}
        <ReportSection title="10. PhD Supervision" printBreak>
          <p className="text-xs text-muted-foreground mb-3">
            Total scholars: <b>{totalScholars}</b> | Awarded: <b>{phdAwarded || '—'}</b> | Ongoing: <b>{phdOngoing}</b>
          </p>
          <DataTable
            headers={['#', 'Scholar', 'Reg. No.', 'University', 'Role', 'Reg. Date', 'Status']}
            rows={appData.phdScholars.map((s, i) => [i + 1, s.scholarName, s.regNo, s.university, s.role, s.regDate, s.status])}
          />
        </ReportSection>

        {/* 11. Declaration */}
        <ReportSection title="11. Verification & Forwarding" printBreak>
          <h4 className="font-semibold text-xs mb-3">11.1 Applicant's Declaration</h4>
          <p className="text-xs text-foreground leading-relaxed mb-8">
            I hereby declare that the information furnished in this CAS Application Report is true and correct to the best of my knowledge and belief.
            All quantitative claims are supported by proof documents uploaded to my CAS folder. I understand that any false statement or suppression
            of material fact may render my application liable to rejection and disciplinary action under the relevant Statutes and Ordinances of MIT-ADT University.
          </p>
          <div className="grid grid-cols-2 gap-8 mb-1">
            <div className="text-xs">
              <div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div>
              <p className="font-medium">{p.applicantName}</p>
              
            </div>
            <div className="text-xs"><div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div><p className="text-muted-foreground">Date</p></div>
            <div />
          </div>

          <h4 className="font-semibold text-xs mb-3">11.2 Verified by Head of Department</h4>
          <p className="text-xs text-foreground leading-relaxed mb-8">
            The applicant is on the rolls of this department in active service. The information furnished above has been verified against the records
            and is recommended for further consideration under the Career Advancement Scheme.
          </p>
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="text-xs"><div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div><p className="text-muted-foreground">Name &  Signature</p></div>
            <div className="text-xs"><div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div><p className="text-muted-foreground">Date</p></div>
          </div>

          <h4 className="font-semibold text-xs mb-3">11.3 Forwarded by Dean, School of Computing</h4>
          <p className="text-xs text-foreground leading-relaxed mb-8">
            Forwarded with the recommendation that the application be placed before the Screening-cum-Evaluation Committee / Selection Committee,
            as applicable, in accordance with UGC Regulations 2018 and the Statutes of MIT-ADT University.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-xs"><div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div><p className="text-muted-foreground">Name & Signature</p></div>
            <div className="text-xs"><div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div><p className="text-muted-foreground">Date</p></div>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-12"></div>
          <div className="text-xs"><div className="border-b border-foreground/30 pb-1 mb-1">&nbsp;</div><p className="text-muted-foreground">Comments, if any</p></div>

        </ReportSection>

        {/* Footer */}
        <div className="p-6 text-center border-t-4 border-primary">
          <p className="text-xs text-muted-foreground font-semibold">— END OF REPORT —</p>
          <p className="text-xs text-muted-foreground mt-1">{p.applicantName} | {p.employeeId}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable report components
function ReportSection({ title, children, printBreak }: { title: string; children: React.ReactNode; printBreak?: boolean }) {
  return (
<div className={`p-10 ${printBreak ? 'print-break' : ''}`}>      <h3 className="text-base font-bold text-foreground mb-4 pb-2 border-b-2 border-accent">{title}</h3>
      {children}
    </div>
  );
}

function ReportTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-xs border-collapse">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
            <td className="border p-2 font-medium w-[40%]">{label}</td>
            <td className="border p-2 font-semibold">{value || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            {headers.map(h => <th key={h} className="border p-2 text-left whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="border p-4 text-center text-muted-foreground italic">No entries</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                {row.map((cell, j) => <td key={j} className="border p-2">
  {typeof cell === 'string' && cell.startsWith('http') ? (
    <a
      href={cell}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      View
    </a>
  ) : (
    cell || '—'
  )}
</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
