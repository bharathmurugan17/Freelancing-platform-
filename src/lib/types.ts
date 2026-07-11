export type Role = 'freelancer' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatar: string;
  company?: string;
  createdAt: number;
}

export interface Education { school: string; degree: string; years: string; }
export interface Experience { company: string; role: string; years: string; description: string; }
export interface PortfolioItem { title: string; image: string; description: string; link?: string; }
export interface CompletedProject { title: string; description: string; year: string; }
export interface Review { id: string; clientId: string; clientName: string; rating: number; text: string; createdAt: number; }

export interface FreelancerProfile {
  userId: string;
  title: string;
  bio: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  availability: string;
  github: string;
  linkedin: string;
  website: string;
  resumeSummary: string;
  education: Education[];
  experience: Experience[];
  certifications: string[];
  portfolio: PortfolioItem[];
  completedProjects: CompletedProject[];
  reviews: Review[];
}

export type ProjectStatus = 'open' | 'in_progress' | 'completed';
export type ProjectType = 'fixed' | 'hourly';
export type ExperienceLevel = 'Entry' | 'Intermediate' | 'Expert';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  category: string;
  deadline: string;
  experienceLevel: ExperienceLevel;
  type: ProjectType;
  freelancersRequired: number;
  attachments: string[];
  status: ProjectStatus;
  selectedFreelancerIds: string[];
  createdAt: number;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  projectId: string;
  freelancerId: string;
  proposal: string;
  expectedBudget: number;
  estimatedTime: string;
  status: ApplicationStatus;
  createdAt: number;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  text: string;
  fileName?: string;
  createdAt: number;
}

export type NotificationType = 'application' | 'accepted' | 'rejected' | 'message' | 'completed' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  text: string;
  link: string;
  read: boolean;
  createdAt: number;
}

export interface SavedJob { userId: string; projectId: string; }

export interface DB {
  users: User[];
  profiles: FreelancerProfile[];
  projects: Project[];
  applications: Application[];
  messages: Message[];
  notifications: AppNotification[];
  saved: SavedJob[];
}

export const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science',
  'DevOps & Cloud', 'Writing & Content', 'Marketing', 'Blockchain', 'AI & Machine Learning',
];
