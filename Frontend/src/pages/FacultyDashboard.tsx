import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { FORM_SECTIONS } from '@/types/cas';
import { getSectionCount, getCompletion } from '@/lib/cas-helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect } from "react";
import API from "@/config/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  User, Briefcase, Shield, GraduationCap, Award, FileText,
  Lightbulb, FolderOpen, Users, LogOut, Send, CheckCircle2,
  Clock, Building2, BookOpen, Eye, Lock, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

const iconMap: Record<string, React.ElementType> = { User, Briefcase, Shield, GraduationCap, Award, FileText, Lightbulb, FolderOpen, Users };

export default function FacultyDashboard() {
  const [user, setUser] = useState<any>(null);
const [myApp, setMyApp] = useState<any>(null);
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);

  const completion = useMemo(() => {
  if (!myApp || !myApp.personalProfile) {
    return { filled: 0, total: 9, percentage: 0, isComplete: false };
  }
  return getCompletion(myApp);
}, [myApp]);
  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const parsedUser = JSON.parse(storedUser);
  setUser(parsedUser);

  fetch(`${API}/api/applications/my/${parsedUser._id}`)
    .then(res => res.json())
    .then(data => {
      if (data && data._id) {
        // ✅ Application exists
        setMyApp({
  ...data,
  personalProfile: data.personalProfile || {}
});
      } else {
        // 🔥 CREATE NEW APPLICATION
        fetch(`${API}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            facultyId: parsedUser._id,
            personalProfile: {
  applicantName: "",
  employeeId: "",
  school: "",
  department: "",
  currentDesignation: "",
  appliedForPost: ""
},
            previousExperience: [],
            administrativeRoles: [],
            teachingWorkload: [],
            fdpEntries: [],
            publications: [],
            patents: [],
            researchProjects: [],
            phdScholars: [],
            status: "draft"
          })
        })
          .then(res => res.json())
          .then(newApp => {
            setMyApp(newApp);
          });
      }
    });
}, []);
  if (!user || !myApp) return null;

  const handleSubmit = async () => {
  try {
    const res = await fetch(`${API}/api/applications/${myApp._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({
        ...myApp,
        status: "submitted"
      })
    });

    const data = await res.json();

    setMyApp(data);

    setPreviewOpen(false);

    toast.success("Application submitted successfully ✅");
  } catch (err) {
    toast.error("Submission failed ❌");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30">
      {/* Blue gradient navbar */}
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
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/15 hover:text-white gap-1.5"
        onClick={() => window.open('/cas-instructions.html', '_blank')}
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Instructions</span>
      </Button>

      <div className="hidden md:flex flex-col items-end px-3 border-l border-white/20">
        <p className="text-sm font-semibold text-white leading-tight">
          {user.name}
        </p>
        <p className="text-xs text-white">
          {user.employeeId} · Faculty
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/");
}}
        className="text-white hover:bg-white/15 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>

  </div>
</header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Hero */}
       <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-300 via-blue-50 to-indigo-100 border border-blue-200 shadow-sm relative overflow-hidden">

  {/* Soft glow accents */}
  <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-300/30 rounded-full blur-3xl" />
  <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />

  <div className="relative px-5 py-5 sm:px-6 sm:py-6">
    <div className="grid lg:grid-cols-2 gap-5 items-center">

      {/* LEFT */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-900 flex items-center gap-1.5">
          <Sparkles className="h-6 w-6" />
          Academic Year 2026–27
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          CAS Application
        </h2>

        <p className="text-sm text-gray-700">
          {myApp.personalProfile.currentDesignation || 'Current Designation'}
          <span className="mx-2 text-gray-400">→</span>
          <span className="font-semibold text-black-900">
            {myApp.personalProfile.appliedForPost || 'Applied Post'}
          </span>
        </p>

        {/* Progress */}
        <div className="pt-2">
          <div className="flex justify-between text-[11px] text-black-900 mb-1">
            <span>Progress</span>
            <span className="font-medium">{completion.percentage}%</span>
          </div>
          <Progress value={completion.percentage} className="h-1.5 bg-blue-200" />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-start lg:items-end gap-3">

        {/* Status + CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={`text-[11px] px-3 py-1 rounded-full border ${
              myApp.status === 'submitted'
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-yellow-100 text-yellow-700 border-yellow-300'
            }`}
          >
            {myApp.status === 'submitted' ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Submitted
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Draft
              </>
            )}
          </Badge>

    {myApp.status === 'draft' && (
  <div className="flex gap-2 flex-wrap">

    {/* ✅ PREVIEW REPORT BUTTON */}
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        navigate(`/faculty/report/${myApp._id}`, {
          state: { appData: { ...myApp } }
        })
      }
      className="rounded-full px-4 py-1.5 text-xs font-semibold"
    >
      <Eye className="h-3.5 w-3.5 mr-1" />
      Preview Report
    </Button>

    {/* ✅ SUBMIT BUTTON */}
    <Button
      size="sm"
      disabled={!completion.isComplete}
      onClick={handleSubmit}
      className="rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm
      bg-blue-600 text-white hover:bg-blue-700
      disabled:bg-gray-300 disabled:text-gray-500"
    >
      {completion.isComplete ? (
        <>
          <Send className="h-3.5 w-3.5 mr-1" />
          Submit
        </>
      ) : (
        <>
          <Lock className="h-3.5 w-3.5 mr-1" />
          Complete all
        </>
      )}
    </Button>

  </div>
)}
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs shadow-sm">
            <span className="text-gray-500">Sections:</span>{' '}
            <span className="font-semibold text-gray-900">
              {completion.filled}/{completion.total}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs shadow-sm">
            <span className="text-gray-500">Status:</span>{' '}
            <span className="font-semibold capitalize text-gray-900">
              {myApp.status}
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

        {/* Section Header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">Application Sections</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Complete all 9 sections to unlock submission</p>
          </div>
        </div>

        {/* Square polished tile grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-5">
          {FORM_SECTIONS.map((section, idx) => {
            const Icon = iconMap[section.icon] || FileText;
            const count = getSectionCount(myApp, section.id);
            const filled = count > 0;
            return (
<button
  key={section.id}
  onClick={() => navigate(`/faculty/form/${section.id}`)}
  className={`text-left transition-all duration-300 hover:-translate-y-1 ${
    filled ? 'opacity-100' : ''
  }`}
>
<div className="bg-card border border-blue-700 hover:border-blue-900 rounded-2xl p-5 h-full shadow-sm hover:shadow-md flex flex-col transition-all duration-300">    {/* Top Row */}
    <div className="flex items-start justify-between mb-3">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
          filled ? 'bg-gradient-primary' : 'bg-muted'
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            filled ? 'text-white' : 'text-primary'
          }`}
        />
      </div>

      {filled ? (
        <span className="text-[11px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
          {count} entries
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
          Pending
        </span>
      )}
    </div>

    {/* Title */}
    <h3 className="text-sm font-bold text-foreground">
      {section.label}
    </h3>

    {/* Description */}
    <p className="text-xs text-muted-foreground mt-1 flex-1">
      {section.description}
    </p>

    {/* Footer */}
    <div className="mt-3 pt-3 border-t border-muted-foreground/20 text-xs text-primary font-medium flex justify-between items-center">
      <span>{filled ? 'Edit details' : 'Start filling'}</span>
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </div>
  </div>
</button>
            );
          })}
        </div>
      </main>

      {/* Preview & Submit Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Review Your Application
            </DialogTitle>
            <DialogDescription>
              Once submitted, your application becomes read-only and visible to the Admin panel. Verify details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Applicant</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-semibold">{myApp.personalProfile?.applicantName || ""}</span></div>
                <div><span className="text-muted-foreground">Employee ID:</span> <span className="font-semibold">{myApp.personalProfile?.employeeId || ""}</span></div>
                <div><span className="text-muted-foreground">School:</span> <span className="font-semibold">{myApp.personalProfile?.school || ""}</span></div>
                <div><span className="text-muted-foreground">Department:</span> <span className="font-semibold">{myApp.personalProfile?.department || ""}</span></div>
                <div><span className="text-muted-foreground">Current:</span> <span className="font-semibold">{myApp.personalProfile?.currentDesignation || ""}</span></div>
                <div><span className="text-muted-foreground">Applied for:</span> <span className="font-semibold text-primary">{myApp.personalProfile?.appliedForPost || ""}</span></div>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gradient-navbar text-white">
                  <tr>
                    <th className="text-left p-2.5 font-semibold w-12">#</th>
                    <th className="text-left p-2.5 font-semibold">Section</th>
                    <th className="text-center p-2.5 font-semibold">Entries</th>
                    <th className="text-center p-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {FORM_SECTIONS.map((s, i) => {
                    const c = getSectionCount(myApp, s.id);
                    return (
                      <tr key={s.id} className="border-t">
                        <td className="p-2.5 text-muted-foreground">{i + 1}</td>
                        <td className="p-2.5 font-medium">{s.label}</td>
                        <td className="p-2.5 text-center font-semibold">{c}</td>
                        <td className="p-2.5 text-center">
                          {c > 0
                            ? <span className="inline-flex items-center gap-1 text-success text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</span>
                            : <span className="inline-flex items-center gap-1 text-destructive text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Send className="h-4 w-4 mr-1.5" /> Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
