import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CASApplication, User, DEFAULT_PERSONAL_PROFILE } from '@/types/cas';

interface AppState {
  user: User | null;
  users: User[];
  applications: CASApplication[];
  currentApplication: CASApplication | null;
}

interface AppContextType extends AppState {
  login: (email: string, password: string, role: 'admin' | 'faculty') => { ok: boolean; error?: string };
  signup: (name: string, email: string, employeeId: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  setCurrentApplication: (app: CASApplication | null) => void;
  updateApplication: (app: CASApplication) => void;
  createNewApplication: (facultyId: string, name: string, empId: string) => CASApplication;
  submitApplication: (appId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);
const STORAGE_KEY = 'cas_app_state_v2';

function loadState(): Partial<AppState> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveState(state: Partial<AppState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const DEMO_ADMIN: User = { id: 'admin-1', name: 'Dr. Registrar', email: 'admin@mituniversity.edu.in', role: 'admin', password: 'admin123' };

const DEMO_FACULTY: User = { id: 'faculty-1', name: 'Dr. ABCD EFGH', email: 'abcd.efgh@mituniversity.edu.in', role: 'faculty', employeeId: 'MITU1234', password: 'faculty123' };

const DEMO_APPLICATION: CASApplication = {
  id: 'demo-1',
  facultyId: 'faculty-1',
  facultyName: 'Dr. ABCD EFGH',
  employeeId: 'MITU1234',
  status: 'submitted',
  submissionDate: '15 April 2026',
  lastModified: new Date().toISOString(),
  completionPercentage: 100,
  personalProfile: {
    ...DEFAULT_PERSONAL_PROFILE,
    employeeId: 'MITU1234',
    applicantName: 'Dr. ABCD EFGH',
    school: 'School of Computing',
    department: 'CSE',
    currentDesignation: 'Associate Professor',
    appliedForPost: 'Professor',
    dateOfBirth: '12/05/1985',
    gender: 'Male',
    ugCompletionDate: '20/06/2006',
    pgCompletionDate: '15/07/2008',
    setNetDate: 'NA',
    phdCompletionDate: '10/03/2017',
    postDocDate: 'NA',
    joiningDateAssistantProf: '01/08/2008',
    joiningDateAssociateProf: 'NA',
    joiningDateMAEER: '01/07/2015',
    joiningDateMITADT: '01/07/2015',
    totalTeachingExperience: 17.7,
    postPGExperience: 17.8,
    googleScholarUrl: 'https://scholar.google.com/citations?user=XXXX',
    googleScholarCitations: 150,
    hIndex: 7,
    i10Index: 5,
    vidwanId: '123456',
    scopusAuthorId: '57212345678',
    orcidId: '0000-0002-1234-5678',
    publonsId: 'AAA-1234-2020',
    email: 'abcd.efgh@mituniversity.edu.in',
    mobile: '+91-9876543210',
  },
  previousExperience: [
    { id: '1', sno: 1, institution: 'XYZ Engineering College', city: 'Pune, IN', designation: 'Lecturer', nature: 'Teaching', joiningDate: '01/08/2008', relievingDate: '30/06/2012', years: 3.9, reason: 'Higher studies', proofLink: 'https://drive.google.com/...' },
    { id: '2', sno: 2, institution: 'ABC Institute of Technology', city: 'Mumbai, IN', designation: 'Assistant Professor', nature: 'Teaching', joiningDate: '01/07/2012', relievingDate: '30/06/2015', years: 3, reason: 'Better opportunity', proofLink: 'https://drive.google.com/...' },
  ],
  administrativeRoles: [
    { id: '1', sno: 1, role: 'Class Coordinator — TY CSE', level: 'Department', fromDate: '01/07/2023', toDate: '30/06/2024', outcome: 'Coordinated 120 students; 96% pass rate', proofLink: 'https://drive.google.com/...' },
  ],
  teachingWorkload: [
    { id: '1', sno: 1, semester: 'Odd', courseCode: 'CS301', courseName: 'Data Structures', programme: 'B.Tech CSE SY', theoryHrs: 3, practicalHrs: 2, tutorialHrs: 1 },
  ],
  fdpEntries: [
    { id: '1', sno: 1, title: 'Outcome Based Education', type: 'FDP', durationWeeks: 2, fromDate: '05/06/2024', toDate: '18/06/2024', mode: 'Online', organiser: 'AICTE-ATAL', certificateNo: 'ATAL/2024/12345', proofLink: 'https://drive.google.com/...' },
  ],
  publications: [
    { id: '1', sno: 1, title: 'Quality-of-Service Aware Routing in IoT', venue: 'IEEE IoT Journal', type: 'Journal', indexing: 'SCI', quartile: 'Q1', doi: '10.1109/JIOT.2024.123', monthYear: 'Mar-2024', authorship: 'First', citations: 25, impactFactor: '10.6', proofLink: 'https://drive.google.com/...' },
  ],
  patents: [
    { id: '1', sno: 1, title: 'AI-based Crop Disease Detection', applicationNo: '202421012345', filingDate: '15/02/2024', status: 'Published', pubGrantDate: '20/08/2024', country: 'India', inventorPosition: 'First', proofLink: 'https://drive.google.com/...' },
  ],
  researchProjects: [
    { id: '1', sno: 1, title: 'AI for Precision Agriculture', agency: 'DST-SERB', type: 'Govt', fundingAmount: '₹25,00,000', role: 'PI', startDate: '01/04/2024', endDate: '31/03/2027', status: 'Ongoing', proofLink: 'https://drive.google.com/...' },
  ],
  phdScholars: [
    { id: '1', sno: 1, scholarName: 'Ms. Shahin Shoukat Makubhai', regNo: 'MITU21PHDT0020', university: 'MIT-ADT University', role: 'Supervisor', regDate: '15/08/2021', status: 'Submitted', proofLink: 'https://drive.google.com/...' },
  ],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();
    return {
      user: saved.user || null,
      users: saved.users || [DEMO_ADMIN, DEMO_FACULTY],
      applications: saved.applications || [DEMO_APPLICATION],
      currentApplication: null,
    };
  });

  useEffect(() => {
    saveState({ user: state.user, users: state.users, applications: state.applications });
  }, [state.user, state.users, state.applications]);

  const login = useCallback((email: string, password: string, role: 'admin' | 'faculty') => {
    const found = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role);
    if (!found) return { ok: false, error: 'Invalid email or password' };
    setState(prev => ({ ...prev, user: found }));
    return { ok: true };
  }, [state.users]);

  const signup = useCallback((name: string, email: string, employeeId: string, password: string) => {
    if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists' };
    }
    const newUser: User = { id: `faculty-${Date.now()}`, name, email, employeeId, password, role: 'faculty' };
    setState(prev => ({ ...prev, users: [...prev.users, newUser], user: newUser }));
    return { ok: true };
  }, [state.users]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, user: null, currentApplication: null }));
  }, []);

  const setCurrentApplication = useCallback((app: CASApplication | null) => {
    setState(prev => ({ ...prev, currentApplication: app }));
  }, []);

  const updateApplication = useCallback((app: CASApplication) => {
    app.lastModified = new Date().toISOString();
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(a => a.id === app.id ? app : a),
      currentApplication: prev.currentApplication?.id === app.id ? app : prev.currentApplication,
    }));
  }, []);

  const createNewApplication = useCallback((facultyId: string, name: string, empId: string) => {
    const app: CASApplication = {
      id: `app-${Date.now()}`,
      facultyId, facultyName: name, employeeId: empId,
      status: 'draft',
      lastModified: new Date().toISOString(),
      completionPercentage: 0,
      personalProfile: { ...DEFAULT_PERSONAL_PROFILE, applicantName: name, employeeId: empId },
      previousExperience: [], administrativeRoles: [], teachingWorkload: [], fdpEntries: [],
      publications: [], patents: [], researchProjects: [], phdScholars: [],
    };
    setState(prev => ({ ...prev, applications: [...prev.applications, app], currentApplication: app }));
    return app;
  }, []);

  const submitApplication = useCallback((appId: string) => {
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.id === appId ? { ...a, status: 'submitted' as const, submissionDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) } : a
      ),
    }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, login, signup, logout, setCurrentApplication, updateApplication, createNewApplication, submitApplication }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be within AppProvider');
  return ctx;
}
