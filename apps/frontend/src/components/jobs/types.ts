export interface Job {
  id: number;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  modality: string | null;
  level: string;
  technologies: string | null;
  source: string | null;
  link: string;
  publishedAt: string | null;
  collectedAt?: string | null;
  contractType?: string | null;
  salaryText?: string | null;
  contactsText?: string | null;
  isFavorite?: boolean;
  isApplied?: boolean;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
