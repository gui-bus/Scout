import { BaseCollector } from "./base-collector";

export class JoobleCollector extends BaseCollector {
  private readonly baseUrl = "https://br.jooble.org/api";
  private readonly query: string;
  private readonly apiKey: string;
  private readonly location: string;
  private readonly resultsPerPage: number;
  private readonly maxPages: number;
  private readonly headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; JobTracker/1.0)",
  };

  constructor(
    query: string,
    apiKey: string,
    location = "Brasil",
    resultsPerPage = 100,
    maxPages = 5,
    maxAgeDays = 90
  ) {
    super(maxAgeDays);
    this.query = query;
    this.apiKey = apiKey;
    this.location = location;
    this.resultsPerPage = resultsPerPage;
    this.maxPages = maxPages;
  }

  get source(): string {
    return "Jooble";
  }

  get queryKey(): string {
    const q = this.query.trim().toLowerCase();
    const loc = this.location.trim().toLowerCase();
    return `query=${q};location=${loc}`;
  }

  async collect(): Promise<any[]> {
    const jobs: any[] = [];
    let page = 1;

    while (page <= this.maxPages) {
      const payload = await this.fetchPage(page);
      const items = payload.jobs || [];

      if (items.length === 0) break;

      const pageJobs = items.map((item: any) => this.normalizeJob(item));

      for (const job of pageJobs) {
        if (this.isDateWithinPeriod(job.publishedAt)) {
          jobs.push(job);
        }
      }

      const total = payload.totalCount || 0;
      if (page * this.resultsPerPage >= total) break;

      page++;
    }

    return jobs;
  }

  private async fetchPage(page: number): Promise<any> {
    if (!this.apiKey) {
      throw new Error("JOOBLE_API_KEY is not configured.");
    }

    const response = await fetch(`${this.baseUrl}/${this.apiKey}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        keywords: this.query,
        location: this.location,
        page: page.toString(),
        ResultOnPage: this.resultsPerPage.toString(),
        companysearch: "false",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Jooble page: ${response.statusText}`);
    }

    return response.json();
  }

  private normalizeJob(item: any): any {
    return {
      title: item.title,
      description: item.snippet,
      company: item.company,
      location: item.location,
      modality: this.identifyModality(item),
      level: null,
      technologies: null,
      source: "Jooble",
      link: item.link,
      publishedAt: this.parseDate(item.updated),
    };
  }

  private identifyModality(item: any): string | null {
    const text = [item.title, item.location, item.snippet, item.type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (["remoto", "remote", "home office"].some((term) => text.includes(term))) {
      return "Remoto";
    }

    if (["híbrido", "hibrido", "hybrid"].some((term) => text.includes(term))) {
      return "Híbrido";
    }

    return null;
  }

  private parseDate(value: string | null): Date | null {
    if (!value) return null;
    const adjusted = value.replace(/(\.\d{6})\d+/, "$1");
    const timestamp = Date.parse(adjusted);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
}
