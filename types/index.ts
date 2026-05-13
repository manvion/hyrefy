export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: string[];
  projects: Project[];
  keywords: string[];
  rawText: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  year?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface ATSScore {
  overall: number;
  keyword: number;
  formatting: number;
  experience: number;
  breakdown: ScoreBreakdown;
  suggestions: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  improvementAreas: ImprovementArea[];
}

export interface ScoreBreakdown {
  keywordDensity: number;
  skillsMatch: number;
  experienceRelevance: number;
  educationMatch: number;
  formattingClarity: number;
  actionVerbs: number;
}

export interface ImprovementArea {
  area: string;
  priority: "high" | "medium" | "low";
  suggestion: string;
  impact: string;
}

export interface JobAnalysis {
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceLevel: string;
  industryTerms: string[];
  responsibilities: string[];
}

export type RewriteMode = "PROFESSIONAL" | "TECHNICAL" | "EXECUTIVE" | "STARTUP" | "COUNTRY_SPECIFIC";

export interface RewriteResult {
  mode: RewriteMode;
  original: string;
  rewritten: string;
  improvements: string[];
  atsImpact: string;
}

export interface DashboardStats {
  totalResumes: number;
  totalScans: number;
  avgAtsScore: number;
  scansThisMonth: number;
  scansLimit: number;
  isPremium: boolean;
}
