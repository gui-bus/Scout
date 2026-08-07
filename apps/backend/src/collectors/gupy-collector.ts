import { BaseCollector } from "./base-collector";

export class GupyCollector extends BaseCollector {
  private readonly baseUrl = "https://employability-portal.gupy.io/api/v1/jobs";
  private readonly query: string;
  private readonly limit: number;
  private readonly maxPages: number;
  private readonly headers = {
    "User-Agent": "Mozilla/5.0 (compatible; JobTracker/1.0)",
  };

  constructor(query = "desenvolvedor", limit = 10, maxPages = 3, maxAgeDays = 90) {
    super(maxAgeDays);
    this.query = query;
    this.limit = limit;
    this.maxPages = maxPages;
  }

  get source(): string {
    return "Gupy";
  }

  get queryKey(): string {
    return `query=${this.query.trim().toLowerCase()}`;
  }

  async collect(): Promise<any[]> {
    const jobs: any[] = [];
    let offset = 0;
    let currentPage = 0;

    while (currentPage < this.maxPages) {
      const payload = await this.fetchPage(offset);
      const items = payload.data || [];

      if (items.length === 0) break;

      const pageJobs = items.map((item: any) => this.normalizeJob(item));

      for (const job of pageJobs) {
        if (this.isDateWithinPeriod(job.publishedAt)) {
          jobs.push(job);
        }
      }

      const pagination = payload.pagination || {};
      const total = pagination.total || 0;

      offset += this.limit;
      currentPage++;

      if (this.isPageFullyOutdated(pageJobs)) break;
      if (offset >= total) break;
    }

    return jobs;
  }

  private async fetchPage(offset: number): Promise<any> {
    const params = new URLSearchParams({
      jobName: this.query,
      limit: this.limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Gupy page: ${response.statusText}`);
    }

    return response.json();
  }

  private normalizeJob(item: any): any {
    return {
      title: item.name,
      description: item.description,
      company: item.careerPageName,
      location: this.buildLocation(item),
      modality: this.normalizeModality(item),
      technologies: this.buildTechnologies(item),
      source: "Gupy",
      link: item.jobUrl,
      publishedAt: item.publishedDate ? new Date(item.publishedDate) : null,
    };
  }

  private buildLocation(item: any): string | null {
    const parts = [item.city, item.state, item.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  private normalizeModality(item: any): string | null {
    const workplaceType = item.workplaceType;
    if (workplaceType === "remote") return "Remoto";
    if (workplaceType === "hybrid") return "Híbrido";
    if (workplaceType === "on-site") return "Presencial";
    if (item.isRemoteWork) return "Remoto";
    return null;
  }

  private buildTechnologies(item: any): string | null {
    const skills = item.skills || [];
    const names = skills
      .map((skill: any) => (typeof skill === "string" ? skill : skill?.name))
      .filter(Boolean);

    return names.length > 0 ? names.join(", ") : null;
  }
}
