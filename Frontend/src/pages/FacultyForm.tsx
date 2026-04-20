import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API from "@/config/api";
import { yearsBetween } from '@/lib/cas-helpers';
import { cn } from '@/lib/utils';
import { FORM_SECTIONS } from '@/types/cas';
import { format, isValid, parse } from 'date-fns';
import { AlertCircle, ArrowLeft, Building2, CalendarIcon, CheckCircle2, Link2, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function FacultyForm() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
const [myApp, setMyApp] = useState<any>(null);
const isLocked = myApp?.status === "approved";

  const section = FORM_SECTIONS.find(s => s.id === sectionId);

  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const parsedUser = JSON.parse(storedUser);
  setUser(parsedUser);

  fetch(`${API}/api/applications/my/${parsedUser._id}`)
    .then(res => res.json())
    .then(data => {
  if (!data) {
    // No application yet → create empty one
    setMyApp({
      personalProfile: {},
      previousExperience: [],
      administrativeRoles: [],
      teachingWorkload: [],
      fdpEntries: [],
      publications: [],
      patents: [],
      researchProjects: [],
      phdScholars: []
    });
    return;
  }

  setMyApp({
    ...data,
    personalProfile: data.personalProfile || {},
    previousExperience: data.previousExperience || [],
    administrativeRoles: data.administrativeRoles || [],
    teachingWorkload: data.teachingWorkload || [],
    fdpEntries: data.fdpEntries || [],
    publications: data.publications || [],
    patents: data.patents || [],
    researchProjects: data.researchProjects || [],
    phdScholars: data.phdScholars || []
  });
});
}, []);



  const handleSave = async () => {
  try {
    console.log("CURRENT ID:", myApp?._id);

    let res;

    // ✅ IF NO ID → CREATE
    if (!myApp?._id) {
      res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(myApp)
      });
    } 
    // ✅ IF ID EXISTS → UPDATE
    else {
      res = await fetch(`${API}/api/applications/${myApp._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(myApp)
      });
    }

    const data = await res.json();

    console.log("SAVE RESPONSE:", data);

    setMyApp(data);

    toast.success("Saved to database ✅");

  } catch (err) {
    console.error("SAVE ERROR:", err);
    toast.error("Save failed ❌");
  }
};

useEffect(() => {
  if (!myApp) return;

  const timer = setTimeout(async () => {
    try {
      if (!myApp._id) return; // only update if exists

      console.log("AUTO SAVE ID:", myApp._id);

      await fetch(`${API}/api/applications/${myApp._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(myApp)
      });

    } catch (err) {
      console.error("AUTO SAVE ERROR:", err);
    }
  }, 1000);

  return () => clearTimeout(timer);
}, [myApp]);

  if (!myApp || !section) return null;
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/20">
<header className="sticky top-0 z-50 bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 shadow-xl">
  <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">

    {/* LEFT */}
    <div className="flex items-center gap-2">
      <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm bg-white">
  <img
    src="/src/assets/logo.png"
    alt="Logo"
    className="h-full w-full object-contain"
  />
</div>
      <div>
        <h1 className="font-semibold text-white text-base leading-tight">
          MIT-ADT School Of Computing
        </h1>
        <p className="text-xs text-white">
          Career Advancement Scheme Portal (AY 2025-26 w.e.f. 2026-27)
        </p>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-3">

      {/* BACK BUTTON */}
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white gap-1.5"
        onClick={() => navigate('/faculty')}
      >
        ← Back
      </Button>

      {/* USER INFO */}
      <div className="hidden md:flex flex-col items-end px-3 border-l border-white/20">
        <p className="text-sm font-semibold text-white leading-tight">
          {user?.name}
        </p>
        <p className="text-xs text-white">
          {user?.employeeId} · Faculty
        </p>
      </div>

      {/* SAVE BUTTON */}
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isLocked}
        className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
      >
        Save
      </Button>

    </div>
  </div>
</header>
      {isLocked && (
  <div className="bg-green-100 text-green-700 p-3 text-center font-medium">
    This application is approved and locked 🔒
  </div>
)}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {sectionId === 'personal' && <PersonalProfileTable app={myApp} onUpdate={setMyApp} />}
        {sectionId === 'experience' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="previousExperience" columns={experienceColumns} title="Previous Experience" />}
        {sectionId === 'administrative' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="administrativeRoles" columns={adminColumns} title="Administrative Roles" />}
        {sectionId === 'teaching' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="teachingWorkload" columns={teachingColumns} title="Teaching Workload" />}
        {sectionId === 'fdp' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="fdpEntries" columns={fdpColumns} title="FDP / STTP / MOOC" />}
        {sectionId === 'publications' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="publications" columns={publicationColumns} title="Publications" />}
        {sectionId === 'patents' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="patents" columns={patentColumns} title="Patents" />}
        {sectionId === 'projects' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="researchProjects" columns={projectColumns} title="Research Projects" />}
        {sectionId === 'phd' && <TableForm app={myApp} onUpdate={setMyApp} dataKey="phdScholars" columns={phdColumns} title="PhD Supervision" />}
      </main>
    </div>
  );
}

// Date picker field component
function DatePickerField({ value, onChange, label, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  
  
  const parsedDate = useMemo(() => {
    if (!value || value === 'NA' || value === 'Currently Working' || value === 'Continuing') return undefined;
    const d = parse(value, 'dd/MM/yyyy', new Date());
    return isValid(d) ? d : undefined;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {value || placeholder || 'Select date...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 border-b flex gap-2">
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => { onChange('NA'); setOpen(false); }}>N/A</Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => { onChange('Currently Working'); setOpen(false); }}>Currently Working</Button>
        </div>
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, 'dd/MM/yyyy'));
              setOpen(false);
            }
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={2030}
        />
      </PopoverContent>
    </Popover>
  );
}

// Validation helpers
function validateRequired(value: string | number | undefined, label: string): string | null {
  if (value === undefined || value === null || value === '') return `${label} is required`;
  return null;
}

function validateEmail(value: string): string | null {
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
  return null;
}

function validateMobile(value: string): string | null {
  if (!value) return 'Mobile number is required';
  if (!/^[\d+\-() ]{10,15}$/.test(value)) return 'Invalid mobile format';
  return null;
}

// =============== PERSONAL PROFILE — Exact 30-row table ===============
type RowDef = {
  sno: number;
  particulars: string;
  key?: string;
  type?: 'text' | 'date' | 'select' | 'number' | 'email' | 'auto';
  options?: string[];
  proofKey?: string;
  required?: boolean;
  hasProof?: boolean;
};

const PROFILE_ROWS: RowDef[] = [
  { sno: 1, particulars: 'Employee ID', key: 'employeeId', type: 'text', required: true },
  { sno: 2, particulars: 'Name of Institute', key: 'instituteName', type: 'text', required: true },
  { sno: 3, particulars: 'Name of Applicant', key: 'applicantName', type: 'text', required: true },
  { sno: 4, particulars: 'School', key: 'school', type: 'text', required: true },
  { sno: 5, particulars: 'Department', key: 'department', type: 'select', options: ['ASH', 'CSE','IT'], required: true },
  { sno: 6, particulars: 'Current Designation', key: 'currentDesignation', type: 'select', options: ['Assistant Professor', 'Assistant Professor (Senior Scale)','Associate Professor'], required: true, hasProof: true, proofKey: 'proofCurrentDesignation' },
  { sno: 7, particulars: 'Applied for the Post of', key: 'appliedForPost', type: 'select', options: ['Assistant Professor (Senior Scale)', 'Associate Professor', 'Professor'], required: true },
  { sno: 8, particulars: 'Date of Birth (DD/MM/YYYY)', key: 'dateOfBirth', type: 'date', required: true, hasProof: true, proofKey: 'proofDateOfBirth' },
  { sno: 9, particulars: 'Gender', key: 'gender', type: 'select', options: ['Male', 'Female'], required: true },
  { sno: 10, particulars: 'Completion of UG Degree (DD/MM/YYYY)', key: 'ugCompletionDate', type: 'date',required: true, hasProof: true, proofKey: 'proofUG' },
  { sno: 11, particulars: 'Completion of PG Degree (DD/MM/YYYY)', key: 'pgCompletionDate', type: 'date', required: true, hasProof: true, proofKey: 'proofPG' },
  { sno: 12, particulars: 'SET / NET / JRF / CSIR / ASRB (DD/MM/YYYY) — write NA if not applicable', key: 'setNetDate', type: 'date', hasProof: true, proofKey: 'proofSetNet' },
  { sno: 13, particulars: 'Completion of PhD (Date of notification) DD/MM/YYYY', key: 'phdCompletionDate', type: 'date',required: true, hasProof: true, proofKey: 'proofPhD' },
  { sno: 14, particulars: 'Completion of Post-Doc — write NA if not applicable', key: 'postDocDate', type: 'date', hasProof: true, proofKey: 'proofPostDoc' },
  { sno: 15, particulars: 'Joining Date as Assistant Professor / Lecturer (first ever)', key: 'joiningDateAssistantProf', type: 'date', required: true, hasProof: true, proofKey: 'proofJoinAsst' },
  { sno: 16, particulars: 'Joining Date as Associate Professor — write NA if not applicable', key: 'joiningDateAssociateProf', type: 'date', hasProof: true, proofKey: 'proofJoinAssoc' },
  { sno: 17, particulars: 'Joining Date in MAEER', key: 'joiningDateMAEER', type: 'date', required: true, hasProof: true, proofKey: 'proofJoinMAEER' },
  { sno: 18, particulars: 'Joining Date in MIT-ADT University', key: 'joiningDateMITADT', type: 'date', required: true, hasProof: true, proofKey: 'proofJoinMITADT' },
  { sno: 19, particulars: 'Total Teaching Experience (Years) — auto-calculated', key: 'totalTeachingExperience', type: 'auto' },
  { sno: 20, particulars: 'Post-PG Experience (Years) — auto-calculated', key: 'postPGExperience', type: 'auto' },
  { sno: 21, particulars: 'Google Scholar Profile URL', key: 'googleScholarUrl', type: 'text',required: true, hasProof: true, proofKey: 'proofGoogleScholar' },
  { sno: 22, particulars: 'Google Scholar Citations (count)', key: 'googleScholarCitations', type: 'number', required: true, hasProof: true, proofKey: 'proofCitations' },
  { sno: 23, particulars: 'h-Index', key: 'hIndex', type: 'number', hasProof: true, required: true, proofKey: 'proofHIndex' },
  { sno: 24, particulars: 'i10-Index', key: 'i10Index', type: 'number', required: true, hasProof: true, proofKey: 'proofI10' },
  { sno: 25, particulars: 'Vidwan ID', key: 'vidwanId', type: 'text', required: true, hasProof: true, proofKey: 'proofVidwan' },
  { sno: 26, particulars: 'Scopus Author ID', key: 'scopusAuthorId', required: true, type: 'text', hasProof: true, proofKey: 'proofScopus' },
  { sno: 27, particulars: 'ORCID ID', key: 'orcidId', type: 'text', required: true, hasProof: true, proofKey: 'proofOrcid' },
  { sno: 28, particulars: 'Publons / Web of Science Researcher ID', key: 'publonsId', type: 'text', hasProof: true, proofKey: 'proofPublons',required: true, },
  { sno: 29, particulars: 'Email (Institutional)', key: 'email', type: 'email', required: true },
  { sno: 30, particulars: 'Mobile', key: 'mobile', type: 'text', required: true },
];

function PersonalProfileTable({ app, onUpdate }: { app: any; onUpdate: (app: any) => void }) {
  const [profile, setProfile] = useState<any>(app.personalProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isLocked = app?.status === "approved";

  useEffect(() => {
    const total = yearsBetween(profile.joiningDateAssistantProf || '');
    const postPG = yearsBetween(profile.pgCompletionDate || '');
    if (total !== profile.totalTeachingExperience || postPG !== profile.postPGExperience) {
      const updated = { ...profile, totalTeachingExperience: total, postPGExperience: postPG };
      setProfile(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.joiningDateAssistantProf, profile.pgCompletionDate]);

  const update = (key: string, value: any) => {
  const updated = { ...profile, [key]: value };
  setProfile(updated);

  onUpdate((prev: any) => ({
  ...prev,
  personalProfile: updated
}));
};

  const validate = () => {
    const errs: Record<string, string> = {};
    PROFILE_ROWS.forEach(r => {
      if (r.required && r.key) {
        const v = profile[r.key];
        if (v === undefined || v === null || v === '' || v === 0) errs[r.key] = 'Required';
      }
    });
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Invalid email';
    if (profile.mobile && !/^[\d+\-() ]{10,15}$/.test(profile.mobile)) errs.mobile = 'Invalid mobile';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {

      toast.success('Personal Profile validated and saved!');
    } else {
      toast.error(`Please fix ${Object.keys(errs).length} field(s)`);
    }
  };

  const renderInput = (r: RowDef) => {
    if (!r.key) return null;
    const k = r.key;
    const val = profile[k];
    const err = errors[k];
    if (r.type === 'select') {
      return (
        <Select value={val || ''} onValueChange={v => update(k, v)} disabled={isLocked}>
          <SelectTrigger className={cn('h-9 bg-blue-100 border-blue-500 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200',
    err && 'border-red-500')}><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>{r.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      );
    }
    if (r.type === 'date') return <DatePickerField value={val || ''} onChange={isLocked ? () => {} : (v) => update(k, v)} />;
    if (r.type === 'auto') {
      return (
        <div className="h-9 px-3 flex items-center bg-success/10 border border-success/30 rounded-md text-sm font-bold text-success">
          {typeof val === 'number' ? val.toFixed(1) : val || '0.0'}
        </div>
      );
    }
    return (
     <Input
  type={r.type === 'number' ? 'number' : r.type === 'email' ? 'email' : 'text'}
  value={val ?? ''}
  onChange={e => update(k, r.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
  disabled={isLocked}
  className={cn(
    'h-9 bg-amber-50 border-amber-400 focus:border-amber-500',
    err && 'border-destructive'
  )}
/>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <Card className="border shadow-card overflow-hidden">
        <div className="bg-gradient-navbar text-white text-center py-3">
          <h2 className="font-bold text-base tracking-wide">PERSONAL PROFILE</h2>
        </div>
        <div className="flex flex-wrap gap-2 px-4 pt-3 text-xs">
  <span className="px-2 py-1 bg-yellow-50 border border-yellow-200 rounded">Faculty Input</span>
  <span className="px-2 py-1 bg-orange-100 border border-orange-300 rounded">Proof Link</span>
  <span className="px-2 py-1 bg-green-100 border border-green-400 rounded">Auto Calculated</span>
</div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/95 text-primary-foreground">
                  <th className="border border-primary/20 p-2.5 font-semibold w-14 text-center">S.No</th>
                  <th className="border border-primary/20 p-2.5 font-semibold text-left">Particulars</th>
                  <th className="border border-primary/20 p-2.5 font-semibold text-left w-[32%]">Faculty Input <span className="text-[11px] font-normal opacity-80">(NA if not applicable)</span></th>
                  <th className="border border-primary/20 p-2.5 font-semibold text-left w-[24%]">Proof Link / Remark</th>
                </tr>
              </thead>
              <tbody>
                {PROFILE_ROWS.map((r, idx) => (
                  <tr key={r.sno} className={cn('hover:bg-muted/40 transition-colors', idx % 2 === 0 ? 'bg-card' : 'bg-muted/20')}>
                    <td className="border p-2.5 text-center font-medium text-muted-foreground">{r.sno}</td>
                    <td className="border p-2.5 text-foreground">
                      {r.particulars}
                      {r.required && <span className="text-destructive ml-1">*</span>}
                    </td>
                    <td className="border p-1.5 align-top">
                      {renderInput(r)}
                      {errors[r.key as string] && (
                        <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 px-1">
                          <AlertCircle className="h-3 w-3" /> {errors[r.key as string]}
                        </p>
                      )}
                    </td>
                    <td className="border p-1.5 align-top">
                      {r.hasProof ? (
                        <div className="relative">
                          <Link2 className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-accent z-10" />
                          <Input
  value={profile[r.proofKey!] ?? ''}
  onChange={e => update(r.proofKey!, e.target.value)}
  disabled={isLocked}
  placeholder="Paste Drive link to PDF"
  className="h-9 pl-7 bg-orange-50 border border-orange-200 text-xs italic placeholder:text-orange-700"
/>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-center block">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span>Fields marked <span className="text-destructive font-bold">*</span> are required. Rows 19 &amp; 20 auto-calculate from joining/PG dates.</span>
        </div>
        <Button onClick={validate} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md font-semibold">
          <CheckCircle2 className="h-4 w-4 mr-2" /> Validate & Save
        </Button>
      </div>
    </div>
  );
}

// Generic table form for array-based sections
interface Column { key: string; label: string; type?: string; options?: string[]; required?: boolean }

function TableForm({ app, onUpdate, dataKey, columns, title }: { app: any; onUpdate: (a: any) => void; dataKey: string; columns: Column[]; title: string }) {
  const [rows, setRows] = useState<any[]>(app[dataKey] || []);
  const isLocked = app?.status === "approved";
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});

  const addRow = () => {
    const newRow: any = { id: `${Date.now()}`, sno: rows.length + 1 };
    columns.forEach(c => { newRow[c.key] = c.type === 'number' ? 0 : ''; });
    const updated = [...rows, newRow];
    setRows(updated);
    onUpdate((prev: any) => ({
  ...prev,
  [dataKey]: updated
}));
  };

  const updateRow = (idx: number, key: string, value: any) => {
    const updated = rows.map((r, i) => i === idx ? { ...r, [key]: value } : r);
    setRows(updated);
    onUpdate((prev: any) => ({
  ...prev,
  [dataKey]: updated
}));
    // Clear error
    if (rowErrors[idx]?.[key]) {
      setRowErrors(prev => {
        const copy = { ...prev };
        if (copy[idx]) { delete copy[idx][key]; }
        return copy;
      });
    }
  };

  const removeRow = (idx: number) => {
    const updated = rows.filter((_, i) => i !== idx).map((r, i) => ({ ...r, sno: i + 1 }));
    setRows(updated);
    onUpdate((prev: any) => ({
  ...prev,
  [dataKey]: updated
}));
  };

  const validateAll = () => {
    const allErrors: Record<number, Record<string, string>> = {};
    rows.forEach((row, idx) => {
      const errs: Record<string, string> = {};
      columns.forEach(col => {
        if (col.required && (!row[col.key] || row[col.key] === '' || row[col.key] === 0)) {
          errs[col.key] = `${col.label} is required`;
        }
      });
      if (Object.keys(errs).length > 0) allErrors[idx] = errs;
    });
    setRowErrors(allErrors);
    if (Object.keys(allErrors).length === 0) {
      toast.success(`${title} validated and saved!`);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
<Card className="border-2 border-slate-400 shadow-md">        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs mt-1">{rows.length} entries added</CardDescription>
          </div>
          <Button size="sm" onClick={addRow} disabled={isLocked} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-1" /> Add Entry
          </Button>
        </CardHeader>
      <CardContent className="pt-6 bg-slate-50/40">
  {rows.length === 0 ? (
    <div className="text-center py-14 text-muted-foreground">
      <div className="h-14 w-14 rounded-full bg-slate-200 mx-auto mb-3 flex items-center justify-center">
        <Plus className="h-6 w-6 opacity-40" />
      </div>
      <p className="text-sm font-medium">No entries yet</p>
      <p className="text-xs mt-1">Click "Add Entry" to start</p>
    </div>
  ) : (
    <div className="space-y-5">
      {rows.map((row, idx) => (
        <div
          key={row.id}
          className="p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                Entry #{idx + 1}
              </span>
            </div>

            <Button
  size="sm"
  variant="ghost"
  onClick={() => removeRow(idx)}
  disabled={isLocked}
              className="text-red-500 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map(col => {
              const error = rowErrors[idx]?.[col.key];

              return (
                <div key={col.key} className="space-y-1.5">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    {col.label}
                    {col.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>

                  {col.type === "select" ? (
                    <Select
                      value={row[col.key] || ""}
                      onValueChange={v =>
                        updateRow(idx, col.key, v)
                      }
                      disabled={isLocked}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-9 bg-slate-50 border-slate-300",
                          error && "border-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {col.options?.map(o => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : col.type === "date" ? (
                    <DatePickerField
  value={row[col.key] || ""}
  onChange={isLocked ? () => {} : (v) => updateRow(idx, col.key, v)}
/>
                  ) : (
                   <Input
  type={col.type === "number" ? "number" : "text"}
  value={row[col.key] ?? ""}
  onChange={e =>
    updateRow(
      idx,
      col.key,
      col.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value
    )
  }
  disabled={isLocked}
  className={cn(
    "h-9 bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200",
    error && "border-red-500"
  )}
/>
                  )}

                  {error && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )}
</CardContent>
      </Card>
      {rows.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={validateAll} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Validate & Save
          </Button>
        </div>
      )}
    </div>
  );
}

const experienceColumns: Column[] = [
  { key: 'institution', label: 'Institution Name', required: true },
  { key: 'city', label: 'City / Country', required: true },
  { key: 'designation', label: 'Designation', required: true },
  { key: 'nature', label: 'Nature', type: 'select', options: ['Teaching', 'Industry', 'Research'], required: true },
  { key: 'joiningDate', label: 'Joining Date', type: 'date', required: true },
  { key: 'relievingDate', label: 'Relieving Date', type: 'date',required: true },
  { key: 'years', label: 'Years', type: 'number',required: true },
  { key: 'proofLink', label: 'Proof Link' ,required: true},
];

const adminColumns: Column[] = [
  { key: 'role', label: 'Role / Responsibility', required: true },
  { key: 'level', label: 'Level', type: 'select', options: ['Department', 'Institute', 'University', 'National'], required: true },
  { key: 'fromDate', label: 'From Date', type: 'date', required: true },
  { key: 'toDate', label: 'To Date', type: 'date' },
  { key: 'proofLink', label: 'Proof Link' ,required: true},
];

const teachingColumns: Column[] = [
  { key: 'semester', label: 'Semester', type: 'select', options: ['Odd', 'Even'], required: true },
  { key: 'courseCode', label: 'Course Code', required: true },
  { key: 'courseName', label: 'Course Name', required: true },
  { key: 'programme', label: 'Programme(B.Tech/ M.Tech/ M.Sc) & Year(FY/SY/TY/LY)', required: true },
  { key: 'theoryHrs', label: 'Theory Hrs/Wk', type: 'number',required: true, },
  { key: 'practicalHrs', label: 'Practical Hrs/Wk', type: 'number',required: true, },
  { key: 'tutorialHrs', label: 'Tutorial Hrs/Wk', type: 'number',required: true, },
];

const fdpColumns: Column[] = [
  { key: 'title', label: 'Title of Programme', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['FDP', 'STTP', 'Refresher', 'Orientation', 'NPTEL', 'MOOC',  'Other'], required: true },
  { key: 'durationWeeks', label: 'Duration (Weeks)', type: 'number',required: true },
  { key: 'fromDate', label: 'From Date', type: 'date', required: true },
  { key: 'toDate', label: 'To Date', type: 'date',required: true },
  { key: 'mode', label: 'Mode', type: 'select', options: ['Online', 'Offline', 'Hybrid'],required: true },
  { key: 'organiser', label: 'Organised By', required: true },
  { key: 'proofLink', label: 'Proof Link',required: true },
];

const publicationColumns: Column[] = [
  { key: 'title', label: 'Title of Paper', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['Journal', 'Conference', 'Book', 'Book Chapter'], required: true },
  { key: 'indexing', label: 'Indexing', type: 'select', options: ['SCI', 'SCIE','ESCI', 'Scopus', 'WoS', 'Google Scholar', 'Other'],required: true },
  { key: 'quartile', label: 'Quartile', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4', 'NA'],required: true },
  { key: 'doi', label: 'DOI' },
  { key: 'monthYear', label: 'Month-Year',required: true },
  { key: 'authorship', label: 'Authorship', type: 'select', options: ['Solo', 'First', 'Corresponding', 'Co-Author'],required: true },
  { key: 'citations', label: 'Citations', type: 'number' },
  { key: 'impactFactor', label: 'Impact Factor' },
  { key: 'proofLink', label: 'Proof Link',required: true },
];

const patentColumns: Column[] = [
  { key: 'title', label: 'Title of Patent'},
  { key: 'applicationNo', label: 'Application No.' },
  { key: 'filingDate', label: 'Filing Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['Filed', 'Published', 'Granted'] },
  { key: 'pubGrantDate', label: 'Pub/Grant Date', type: 'date' },
  { key: 'country', label: 'Country' },
  { key: 'inventorPosition', label: 'Inventor Position', type: 'select', options: ['Solo', 'First', 'Co'] },
  { key: 'proofLink', label: 'Proof Link' },
];

const projectColumns: Column[] = [
  { key: 'title', label: 'Title of Project' },
  { key: 'agency', label: 'Funding Agency' },
  { key: 'type', label: 'Type', type: 'select', options: ['Govt', 'Industry', 'Institute','University', 'International','NGO'] },
  { key: 'fundingAmount', label: 'Funding (INR)' },
  { key: 'role', label: 'Role', type: 'select', options: ['PI', 'Co-PI'] },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['Ongoing', 'Completed','Submitted'] },
  { key: 'proofLink', label: 'Proof Link' },
];

const phdColumns: Column[] = [
  { key: 'scholarName', label: 'Scholar Name' },
  { key: 'regNo', label: 'PhD Reg. No.'},
  { key: 'university', label: 'University' },
  { key: 'role', label: 'Role', type: 'select', options: ['Supervisor', 'Co-Supervisor'] },
  { key: 'regDate', label: 'Registration Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['Ongoing', 'Submitted', 'Awarded'] },
  { key: 'proofLink', label: 'Proof Link' },
];
