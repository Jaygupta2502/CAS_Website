export type UserRole = 'admin' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  password?: string;
}

export interface PersonalProfile {
  employeeId: string;
  instituteName: string;
  applicantName: string;
  school: string;
  department: string;
  currentDesignation: string;
  appliedForPost: string;
  dateOfBirth: string;
  gender: string;
  ugCompletionDate: string;
  pgCompletionDate: string;
  setNetDate: string;
  phdCompletionDate: string;
  postDocDate: string;
  joiningDateAssistantProf: string;
  joiningDateAssociateProf: string;
  joiningDateMAEER: string;
  joiningDateMITADT: string;
  totalTeachingExperience: number;
  postPGExperience: number;
  googleScholarUrl: string;
  googleScholarCitations: number;
  hIndex: number;
  i10Index: number;
  vidwanId: string;
  scopusAuthorId: string;
  orcidId: string;
  publonsId: string;
  email: string;
  mobile: string;
  // Per-row proof links (matches Proof Link / Remark column)
  proofCurrentDesignation?: string;
  proofDateOfBirth?: string;
  proofUG?: string;
  proofPG?: string;
  proofSetNet?: string;
  proofPhD?: string;
  proofPostDoc?: string;
  proofJoinAsst?: string;
  proofJoinAssoc?: string;
  proofJoinMAEER?: string;
  proofJoinMITADT?: string;
  proofGoogleScholar?: string;
  proofCitations?: string;
  proofHIndex?: string;
  proofI10?: string;
  proofVidwan?: string;
  proofScopus?: string;
  proofOrcid?: string;
  proofPublons?: string;
}

export interface PreviousExperience {
  id: string;
  sno: number;
  institution: string;
  city: string;
  designation: string;
  nature: string;
  joiningDate: string;
  relievingDate: string;
  years: number;
  reason: string;
  proofLink: string;
}

export interface AdministrativeRole {
  id: string;
  sno: number;
  role: string;
  level: string;
  fromDate: string;
  toDate: string;
  outcome: string;
  proofLink: string;
}

export interface TeachingWorkload {
  id: string;
  sno: number;
  semester: string;
  courseCode: string;
  courseName: string;
  programme: string;
  theoryHrs: number;
  practicalHrs: number;
  tutorialHrs: number;
}

export interface FDPEntry {
  id: string;
  sno: number;
  title: string;
  type: string;
  durationWeeks: number;
  fromDate: string;
  toDate: string;
  mode: string;
  organiser: string;
  certificateNo: string;
  proofLink: string;
}

export interface Publication {
  id: string;
  sno: number;
  title: string;
  venue: string;
  type: string;
  indexing: string;
  quartile: string;
  doi: string;
  monthYear: string;
  authorship: string;
  citations: number;
  impactFactor: string;
  proofLink: string;
}

export interface Patent {
  id: string;
  sno: number;
  title: string;
  applicationNo: string;
  filingDate: string;
  status: string;
  pubGrantDate: string;
  country: string;
  inventorPosition: string;
  proofLink: string;
}

export interface ResearchProject {
  id: string;
  sno: number;
  title: string;
  agency: string;
  type: string;
  fundingAmount: string;
  role: string;
  startDate: string;
  endDate: string;
  status: string;
  proofLink: string;
}

export interface PhDScholar {
  id: string;
  sno: number;
  scholarName: string;
  regNo: string;
  university: string;
  role: string;
  regDate: string;
  status: string;
  proofLink: string;
}

export interface EligibilityMetric {
  sno: number;
  metric: string;
  yourValue: string | number;
  ugcMinimum: string | number;
  status: 'MEETS' | 'SHORT';
  sourceSheet: string;
}

export interface CASApplication {
  id: string;
  facultyId: string;
  facultyName: string;
  employeeId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submissionDate?: string;
  lastModified: string;
  completionPercentage: number;
  personalProfile: PersonalProfile;
  previousExperience: PreviousExperience[];
  administrativeRoles: AdministrativeRole[];
  teachingWorkload: TeachingWorkload[];
  fdpEntries: FDPEntry[];
  publications: Publication[];
  patents: Patent[];
  researchProjects: ResearchProject[];
  phdScholars: PhDScholar[];
}

export const DEFAULT_PERSONAL_PROFILE: PersonalProfile = {
  employeeId: '',
  instituteName: 'MIT Art, Design and Technology University',
  applicantName: '',
  school: '',
  department: '',
  currentDesignation: '',
  appliedForPost: '',
  dateOfBirth: '',
  gender: '',
  ugCompletionDate: '',
  pgCompletionDate: '',
  setNetDate: '',
  phdCompletionDate: '',
  postDocDate: '',
  joiningDateAssistantProf: '',
  joiningDateAssociateProf: '',
  joiningDateMAEER: '',
  joiningDateMITADT: '',
  totalTeachingExperience: 0,
  postPGExperience: 0,
  googleScholarUrl: '',
  googleScholarCitations: 0,
  hIndex: 0,
  i10Index: 0,
  vidwanId: '',
  scopusAuthorId: '',
  orcidId: '',
  publonsId: '',
  email: '',
  mobile: '',
};

export const FORM_SECTIONS = [
  { id: 'personal', label: 'Personal Profile', icon: 'User', description: 'Basic details, qualifications & research IDs', fields: 30 },
  { id: 'experience', label: 'Previous Experience', icon: 'Briefcase', description: 'Teaching & industry positions held', fields: 10 },
  { id: 'administrative', label: 'Administrative Roles', icon: 'Shield', description: 'Institutional contributions & responsibilities', fields: 13 },
  { id: 'teaching', label: 'Teaching Workload', icon: 'GraduationCap', description: 'Courses taught in AY 2025-26', fields: 11 },
  { id: 'fdp', label: 'FDP / STTP / MOOC', icon: 'Award', description: 'Faculty development programmes attended', fields: 15 },
  { id: 'publications', label: 'Publications', icon: 'FileText', description: 'Journals, conferences & book chapters', fields: 20 },
  { id: 'patents', label: 'Patents', icon: 'Lightbulb', description: 'Filed, published & granted patents', fields: 9 },
  { id: 'projects', label: 'Research Projects', icon: 'FolderOpen', description: 'Funded research & consultancy projects', fields: 9 },
  { id: 'phd', label: 'PhD Supervision', icon: 'Users', description: 'Doctoral scholars supervised', fields: 9 },
] as const;
