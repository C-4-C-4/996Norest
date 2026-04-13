export type CompanyStatus = 'draft' | 'published' | 'offline';

export interface Fact {
  id: string;
  companyId: string;
  content: string;
  evidenceUrl?: string;
  remark?: string;
}

export interface TimelineEvent {
  id: string;
  companyId: string;
  date: string; // ISO format or YYYY-MM-DD
  description: string;
  evidenceUrl?: string;
  impact?: string;
}

export interface ContractTerm {
  id: string;
  companyId: string;
  originalText: string;
  problem: string;
  risk: string;
  suggestion: string;
  evidenceUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  city: string;
  industry: string;
  summary: string;
  logoUrl?: string;
  tags: string[];
  status: CompanyStatus;
  updatedAt: string;
  facts: Fact[];
  timeline: TimelineEvent[];
  contractTerms: ContractTerm[];
}
