import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import API from "@/config/api";
import { GraduationCap } from "lucide-react";
import { useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Building2, LogOut, Eye, Users, FileText, CheckCircle2,
  Clock, AlertCircle, BarChart3, TrendingUp, ArrowUpRight,
  Search, Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const handleStatus = async (id: string, status: string) => {
  const res = await fetch(`${API}/api/applications/status/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({ status })
  });

  const updated = await res.json();

  setApplications(prev =>
    prev.map(app => (app._id === id ? updated : app))
  );
};


  // Admin sees ONLY submitted applications


  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const parsedUser = JSON.parse(storedUser);
  setUser(parsedUser);

  fetch(`${API}/api/applications`, {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  })
    .then(res => res.json())
    .then(data => {
      setApplications(data);
    });
}, []);

const stats = useMemo(() => {
  const total = applications.length;

  const departments = new Set(
    applications.map(a => a.personalProfile?.department).filter(Boolean)
  ).size;

  const schools = new Set(
    applications.map(a => a.personalProfile?.school).filter(Boolean)
  ).size;

  const avgCompletion =
    total > 0
      ? Math.round(
          applications.reduce((s, a) => s + (a.completionPercentage || 0), 0) /
            total
        )
      : 0;

  return { total, departments, schools, avgCompletion };
}, [applications]);

const allApps = useMemo(() => applications, [applications]);

const filteredApps = useMemo(() => {
  return allApps.filter(app => {
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();

    return (
      (app.personalProfile?.applicantName || "").toLowerCase().includes(q) ||
      app.employeeId.toLowerCase().includes(q) ||
      (app.personalProfile?.department || "").toLowerCase().includes(q) ||
      (app.personalProfile?.school || "").toLowerCase().includes(q)
    );
  });
}, [allApps, searchQuery]);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
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
        <h1 className="text-white font-semibold text-base">
          MIT-ADT School Of Computing
        </h1>
        <p className="text-white text-xs">
          Career Advancement Scheme Portal (AY 2025-26 w.e.f. 2026-27)
        </p>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-white text-sm">{user.name}</p>
        <p className="text-white text-xs">Administrator</p>
      </div>

      <Separator orientation="vertical" className="h-8 hidden sm:block" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/");
}}
        className="text-white text-sm"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>

  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          {[
            { label: 'Submitted Applications', value: stats.total, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Schools', value: stats.schools, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Departments', value: stats.departments, icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Avg. Completion', value: `${stats.avgCompletion}%`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
          ].map(stat => (
            <Card key={stat.label} className="border hover:shadow-card-hover transition-shadow">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2 tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Applications Table */}
        <Card className="border shadow-card animate-slide-up">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-accent" />
                  Faculty Applications
                </CardTitle>
                <CardDescription className="mt-1">Review and manage CAS applications</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, ID, department..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 w-[260px] h-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredApps.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Faculty</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Promotion</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Completion</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map(app => (
                    <TableRow key={app._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-foreground">
  {(app.personalProfile?.applicantName || "NA")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)}
</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
  {app.personalProfile?.applicantName || "No Name"}
</p>
                            <p className="text-xs text-muted-foreground">{app.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
  <p className="text-sm">
    {app.personalProfile?.school || "N/A"}
  </p>
  <p className="text-xs text-muted-foreground">
    {app.personalProfile?.department || "N/A"}
  </p>
</TableCell>
                      <TableCell>
  <p className="text-xs text-muted-foreground">
    {app.personalProfile?.currentDesignation || "N/A"}
  </p>
  <p className="text-xs font-medium text-foreground flex items-center gap-1">
    <ArrowUpRight className="h-3 w-3 text-accent" />
    {app.personalProfile?.appliedForPost || "N/A"}
  </p>
</TableCell>
                      <TableCell>
  {app.status === "draft" ? (
    <Badge className="border text-[11px] font-medium bg-yellow-100 text-yellow-700 border-yellow-300">
      <Clock className="h-3 w-3 mr-1" /> Draft
    </Badge>
  ) : app.status === "submitted" ? (
    <Badge className="border text-[11px] font-medium bg-green-100 text-green-700 border-green-300">
      <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
    </Badge>
  ) : app.status === "approved" ? (
    <Badge className="border text-[11px] font-medium bg-blue-100 text-blue-700 border-blue-300">
      Approved
    </Badge>
  ) : (
    <Badge className="border text-[11px] font-medium bg-red-100 text-red-700 border-red-300">
      Rejected
    </Badge>
  )}
</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${app.completionPercentage}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{app.completionPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
  <div className="flex gap-2 justify-end">

   {app.status === "submitted" && (
  <>
    <Button
      size="sm"
      onClick={() => handleStatus(app._id, "approved")}
      className="bg-green-600 text-white text-xs"
    >
      Approve
    </Button>

    <Button
      size="sm"
      onClick={() => handleStatus(app._id, "rejected")}
      className="bg-red-600 text-white text-xs"
    >
      Reject
    </Button>
  </>
)}

    <Button
      size="sm"
      variant="outline"
      onClick={() => navigate(`/admin/report/${app._id}`)}
    >
      View
    </Button>

  </div>
</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
