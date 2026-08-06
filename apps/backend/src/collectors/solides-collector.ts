import { BaseCollector } from "./base-collector";

export class SolidesCollector extends BaseCollector {
  private readonly baseUrl = "https://apigw.solides.com.br/jobs/v3/portal-vacancies-new";
  private readonly query: string;
  private readonly take: number;
  private readonly maxPages: number;
  private readonly headers = {
    "User-Agent": "Mozilla/5.0 (compatible; JobTracker/1.0)",
  };

  constructor(query: string, take = 14, maxPages = 2, maxAgeDays = 90) {
    super(maxAgeDays);
    this.query = query;
    this.take = take;
    this.maxPages = maxPages;
  }

  get source(): string {
    return "Solides";
  }

  get queryKey(): string {
    return `query=${this.query.trim().toLowerCase()}`;
  }

  async collect(): Promise<any[]> {
    const jobs: any[] = [];
    let page = 1;

    while (page <= this.maxPages) {
      const payload = await this.fetchPage(page);
      const content = payload.data || {};
      const items = content.data || [];

      if (items.length === 0) break;

      const pageJobs = items.map((item: any) => this.normalizeJob(item));

      for (const job of pageJobs) {
        if (this.isDateWithinPeriod(job.publishedAt)) {
          jobs.push(job);
        }
      }

      const totalPages = content.totalPages || page;
      if (page >= totalPages) break;
      if (this.isPageFullyOutdated(pageJobs)) break;

      page++;
    }

    return jobs;
  }

  private async fetchPage(page: number): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      title: this.query,
      take: this.take.toString(),
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Solides page: ${response.statusText}`);
    }

    return response.json();
  }

  private normalizeJob(item: any): any {
    return {
      title: this.cleanText(item.title),
      description: this.cleanHtml(item.description),
      company: item.companyName,
      location: this.buildLocation(item),
      modality: this.normalizeModality(item),
      level: this.identifyLevel(item),
      technologies: this.buildTechnologies(item),
      source: "Solides",
      link: item.redirectLink,
      publishedAt: item.createdAt ? new Date(item.createdAt) : null,
    };
  }

  private identifyLevel(item: any): string | null {
    const seniorities = (item.seniority || []).map((s: any) => s.name?.trim().toLowerCase()).filter(Boolean);
    const contracts = (item.recruitmentContractType || []).map((c: any) => c.name?.trim().toLowerCase()).filter(Boolean);
    const terms = [...seniorities, ...contracts];

    const internshipTerms = ["estágio", "estagio", "estagiário", "estagiario", "estagiária", "estagiaria", "intern"];
    if (terms.some((term) => internshipTerms.includes(term))) {
      return "Estágio";
    }

    const seniorTerms = ["sênior", "senior", "sr"];
    if (terms.some((term) => seniorTerms.includes(term))) {
      return "Sênior";
    }

    const midTerms = ["pleno", "pl"];
    if (terms.some((term) => midTerms.includes(term))) {
      return "Pleno";
    }

    const juniorTerms = ["júnior", "junior", "jr"];
    if (terms.some((term) => juniorTerms.includes(term))) {
      return "Júnior";
    }

    return null;
  }

  private buildLocation(item: any): string | null {
    const city = item.city?.name;
    const state = item.state?.name;
    const parts = [city, state].map((p) => p?.trim()).filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  private normalizeModality(item: any): string | null {
    const modalities: Record<string, string> = {
      remoto: "Remoto",
      hibrido: "Híbrido",
      presencial: "Presencial",
    };
    return modalities[item.jobType] || null;
  }

  private buildTechnologies(item: any): string | null {
    const names = (item.hardSkills || []).map((skill: any) => skill.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : null;
  }

  private cleanHtml(html: string | null): string | null {
    if (!html) return null;
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  private cleanText(text: string | null): string | null {
    return text ? text.trim() : null;
  }
}
