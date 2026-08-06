import { BaseCollector } from "./base-collector";

export class RemotarCollector extends BaseCollector {
  private readonly baseUrl = "https://api.remotar.com.br/jobs";
  private readonly tagId: number;
  private readonly categoryIds: number[];
  private readonly maxPages: number;
  private readonly headers = {
    "User-Agent": "Mozilla/5.0 (compatible; JobTracker/1.0)",
  };

  private readonly levelsByTag: Record<number, string> = {
    10: "Estágio",
    17: "Júnior",
    21: "Pleno",
    23: "Sênior",
  };

  constructor(tagId: number, categoryIds = [4, 7, 13, 14], maxPages = 2, maxAgeDays = 90) {
    super(maxAgeDays);
    this.tagId = tagId;
    this.categoryIds = categoryIds;
    this.maxPages = maxPages;
  }

  get source(): string {
    return "Remotar";
  }

  get queryKey(): string {
    const categories = this.categoryIds.sort((a, b) => a - b).join(",");
    return `tag=${this.tagId};categories=${categories}`;
  }

  async collect(): Promise<any[]> {
    const jobs: any[] = [];
    let page = 1;

    while (page <= this.maxPages) {
      const payload = await this.fetchPage(page);
      const items = payload.data || [];

      if (items.length === 0) break;

      const pageJobs = items.map((item: any) => this.normalizeJob(item));

      for (const job of pageJobs) {
        if (this.isDateWithinPeriod(job.publishedAt)) {
          jobs.push(job);
        }
      }

      if (this.isPageFullyOutdated(pageJobs)) break;

      const lastPage = payload.meta?.last_page || page;
      if (page >= lastPage) break;

      page++;
    }

    return jobs;
  }

  private async fetchPage(page: number): Promise<any> {
    const params = new URLSearchParams({
      search: "",
      tagId: this.tagId.toString(),
      categoryId: this.categoryIds.join(","),
      page: page.toString(),
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Remotar page: ${response.statusText}`);
    }

    return response.json();
  }

  private normalizeJob(item: any): any {
    return {
      title: item.title,
      description: this.cleanHtml(item.description),
      company: this.getCompany(item),
      location: this.buildLocation(item),
      modality: this.normalizeModality(item),
      level: this.identifyLevel(item),
      technologies: this.buildCategories(item),
      source: "Remotar",
      link: this.getLink(item),
      publishedAt: item.createdAt ? new Date(item.createdAt) : null,
    };
  }

  private getLink(item: any): string | null {
    if (item.externalLink) return item.externalLink;
    if (item.id) return `https://remotar.com.br/job/${item.id}`;
    return null;
  }

  private getCompany(item: any): string | null {
    return item.companyDisplayName || item.company?.name || null;
  }

  private identifyLevel(item: any): string | null {
    for (const jobTag of item.jobTags || []) {
      const tagId = jobTag.tag?.id;
      if (tagId && this.levelsByTag[tagId]) {
        return this.levelsByTag[tagId];
      }
    }
    return this.levelsByTag[this.tagId] || null;
  }

  private buildLocation(item: any): string | null {
    const parts = [item.city, item.state].map((p) => p?.trim()).filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    if (item.type === "remote") return "Remoto";
    return null;
  }

  private normalizeModality(item: any): string | null {
    const modalities: Record<string, string> = {
      remote: "Remoto",
      hybrid: "Híbrido",
      "on-site": "Presencial",
    };
    return modalities[item.type] || null;
  }

  private buildCategories(item: any): string | null {
    const names: string[] = [];
    for (const jobCategory of item.jobCategories || []) {
      const name = jobCategory.category?.name;
      if (name) names.push(name);
    }
    const uniqueNames = Array.from(new Set(names));
    return uniqueNames.length > 0 ? uniqueNames.join(", ") : null;
  }

  private cleanHtml(html: string | null): string | null {
    if (!html) return null;
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
}
