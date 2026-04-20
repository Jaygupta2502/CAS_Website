import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, GraduationCap, Building2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import API from "@/config/api";
import { cn } from '@/lib/utils';
import logo from '@/src/components/top.png';
type Tab = 'admin' | 'faculty';
type Mode = 'login' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('faculty');
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const reset = () => { setEmail(''); setPassword(''); setConfirm(''); setName(''); setEmployeeId(''); setError(''); };
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    // ✅ USE mode ONLY
    const url =
      tab === "faculty" && mode === "signup"
        ? `${API}/api/auth/signup`
        : `${API}/api/auth/login`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        employeeId,
        password,
      }),
    });

    const data = await res.json();
    console.log("RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    // ✅ SIGNUP FLOW
    if (tab === "faculty" && mode === "signup") {
      alert("Account created successfully! Please login.");
      setMode("login"); // switch to login
      return;
    }

    // ✅ LOGIN FLOW
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/faculty");
    }

  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    setError(err.message);
  }
};

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[hsl(0,0%,100%)] via-[hsl(240,10%,86%)] to-[hsl(0,0%,100%)] flex flex-col">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-white/30 blur-3xl" />

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
        <h1 className="text-white font-semibold text-base leading-tight">
          MIT-ADT School Of Computing
        </h1>
        <p className="text-white text-xs">
          Career Advancement Scheme Portal (AY 2025-26 w.e.f. 2026-27)
        </p>
      </div>
    </div>

    {/* RIGHT (optional for login page) */}
    <div className="text-white text-sm font-medium">
      CAS Portal
    </div>

  </div>
</header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-black mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-blue/70 text-sm">Academic Year 2026-27</p>
          </div>

          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95">
            <CardHeader className="pb-4">
              {/* Sliding role tabs */}
              <div className="relative grid grid-cols-2 bg-muted rounded-xl p-1 mb-2">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-primary shadow-md transition-transform duration-300 ease-out"
                  style={{ transform: tab === 'admin' ? 'translateX(0)' : 'translateX(calc(100% + 4px))' }}
                />
                <button
                  type="button"
                  onClick={() => { setTab('admin'); setMode('login'); reset(); }}
                  className={cn('relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors', tab === 'admin' ? 'text-white' : 'text-muted-foreground')}
                >
                  <Shield className="h-4 w-4" /> Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('faculty'); reset(); }}
                  className={cn('relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors', tab === 'faculty' ? 'text-white' : 'text-muted-foreground')}
                >
                  <GraduationCap className="h-4 w-4" /> Faculty
                </button>
              </div>

              <CardTitle className="text-xl">
                {mode === 'login' ? `Sign in as ${tab === 'admin' ? 'Administrator' : 'Faculty'}` : 'Create Faculty Account'}
              </CardTitle>
              <CardDescription>
                {mode === 'login' ? 'Enter your credentials to continue' : 'Register to start your CAS application'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="empId">Employee ID</Label>
                      <Input id="empId" value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="MITU1234" />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={tab === 'admin' ? 'admin@mituniversity.edu.in' : 'faculty@mituniversity.edu.in'} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input id="confirm" type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md h-11 text-sm font-semibold">
                  {mode === 'login' ? 'Sign In' : 'Create Account & Sign In'}
                </Button>

                {tab === 'faculty' && (
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
                    <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }} className="text-primary font-semibold hover:underline">
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                )}

                {mode === 'login' && (
                  <p className="text-[11px] text-center text-muted-foreground pt-1 leading-relaxed">
                    Demo: <code className="bg-muted px-1.5 py-0.5 rounded">{tab === 'admin' ? 'admin@mituniversity.edu.in / admin123' : 'abcd.efgh@mituniversity.edu.in / faculty123'}</code>
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="relative z-10 p-4 text-center text-black/50 text-xs">
        © 2026 MIT Art, Design and Technology University, Pune. All rights reserved.
      </footer>
    </div>
  );
}
