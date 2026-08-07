import { BaseCollector } from "./base-collector";

export class RemotiveCollector extends BaseCollector {
  private readonly headers = {
    "User-Agent": "Scout-Job-Board-Collector",
    Accept: "application/json",
  };

  constructor(maxAgeDays = 90) {
    super(maxAgeDays);
  }

  get source(): string {
    return "Remotive";
  }

  get queryKey(): string {
    return "category=software-development";
  }

  async collect(): Promise<any[]> {
    const url = "https://remotive.com/api/remote-jobs?category=software-development";
    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch Remotive jobs: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.jobs)) return [];

    const jobs: any[] = [];

    for (const remoteJob of data.jobs) {
      const publishedAt = remoteJob.publication_date ? new Date(remoteJob.publication_date) : null;
      if (!this.isDateWithinPeriod(publishedAt)) continue;

      const location = (remoteJob.candidate_required_location || "").toLowerCase();
      const isAllowed =
        location === "" ||
        location.includes("brazil") ||
        location.includes("worldwide") ||
        location.includes("latam") ||
        location.includes("latin america") ||
        location.includes("south america") ||
        location.includes("americas");

      if (!isAllowed) continue;

      jobs.push(this.normalizeJob(remoteJob));
    }

    return jobs;
  }

  private normalizeJob(job: any): any {
    const cleanDesc = job.description
      ? job.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : null;

    const technologies = Array.isArray(job.tags) ? job.tags.join(", ") : null;

    return {
      title: job.title,
      description: cleanDesc,
      company: job.company_name || "Empresa no Remotive",
      location: job.candidate_required_location || "Worldwide",
      modality: "Remoto",
      level: "Não especificado",
      technologies: technologies,
      source: "Remotive",
      link: job.url,
      publishedAt: job.publication_date ? new Date(job.publication_date) : null,
      salaryText: job.salary || null,
    };
  }
}
