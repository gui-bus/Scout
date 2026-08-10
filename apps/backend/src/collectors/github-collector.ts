import { BaseCollector } from './base-collector';

export class GithubCollector extends BaseCollector {
  private readonly repo: string;
  private readonly headers = {
    'User-Agent': 'Scout-Job-Board-Collector',
    Accept: 'application/vnd.github.v3+json',
  };

  constructor(repo: string, maxAgeDays = 90) {
    super(maxAgeDays);
    this.repo = repo;
  }

  get source(): string {
    return 'GitHub';
  }

  get queryKey(): string {
    return `repo=${this.repo}`;
  }

  async collect(): Promise<any[]> {
    const url = `https://api.github.com/repos/${this.repo}/issues?state=open&per_page=100`;
    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub issues from ${this.repo}: ${response.statusText}`,
      );
    }

    const issues = await response.json();
    if (!Array.isArray(issues)) return [];

    const jobs: any[] = [];

    for (const issue of issues) {
      if (issue.pull_request) continue;

      const publishedAt = issue.created_at ? new Date(issue.created_at) : null;
      if (!this.isDateWithinPeriod(publishedAt)) continue;

      jobs.push(this.normalizeIssue(issue));
    }

    return jobs;
  }

  private normalizeIssue(issue: any): any {
    const rawTitle = issue.title || '';
    const modality = this.detectModality(issue);
    const level = this.detectLevel(issue);
    const { title, company } = this.parseTitleAndCompany(rawTitle);
    const technologies = this.extractTechnologies(issue);
    const location = this.detectLocation(issue, modality);

    return {
      title: title || rawTitle,
      description: issue.body ? this.cleanMarkdown(issue.body) : null,
      company: company || 'Empresa no GitHub',
      location: location,
      modality: modality,
      level: level || 'Não especificado',
      technologies: technologies,
      source: `GitHub (${this.repo.split('/')[0]})`,
      link: issue.html_url,
      publishedAt: issue.created_at ? new Date(issue.created_at) : null,
    };
  }

  private detectModality(issue: any): string | null {
    const text = [issue.title, ...(issue.labels || []).map((l: any) => l.name)]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (
      text.includes('remoto') ||
      text.includes('remote') ||
      text.includes('teletrabalho')
    ) {
      return 'Remoto';
    }
    if (
      text.includes('hibrido') ||
      text.includes('híbrido') ||
      text.includes('hybrid')
    ) {
      return 'Híbrido';
    }
    if (
      text.includes('presencial') ||
      text.includes('on-site') ||
      text.includes('onsite')
    ) {
      return 'Presencial';
    }
    return null;
  }

  private detectLevel(issue: any): string | null {
    const labels = (issue.labels || []).map((l: any) => l.name.toLowerCase());
    const title = (issue.title || '').toLowerCase();

    if (
      labels.includes('júnior') ||
      labels.includes('junior') ||
      title.includes('junior') ||
      title.includes('júnior') ||
      title.includes('jr')
    ) {
      return 'Júnior';
    }
    if (
      labels.includes('pleno') ||
      title.includes('pleno') ||
      title.includes('mid')
    ) {
      return 'Pleno';
    }
    if (
      labels.includes('sênior') ||
      labels.includes('senior') ||
      title.includes('senior') ||
      title.includes('sênior') ||
      title.includes('sr')
    ) {
      return 'Sênior';
    }
    if (
      labels.includes('estágio') ||
      labels.includes('estagio') ||
      labels.includes('intern') ||
      title.includes('estag')
    ) {
      return 'Estágio';
    }
    return null;
  }

  private parseTitleAndCompany(rawTitle: string): {
    title: string;
    company: string | null;
  } {
    let title = rawTitle.replace(/\[[^\]]+\]/g, '').trim();
    const companyRegex = /\s+(?:na|em|at)\s+([A-Za-z0-9\s\-&]+)$/i;
    const match = title.match(companyRegex);

    let company: string | null = null;
    if (match) {
      company = match[1].trim();
      title = title.substring(0, match.index).trim();
    }

    return { title, company };
  }

  private extractTechnologies(issue: any): string | null {
    const list: string[] = [];
    const ignoreWords = [
      'remoto',
      'hibrido',
      'híbrido',
      'presencial',
      'junior',
      'júnior',
      'pleno',
      'senior',
      'sênior',
      'estágio',
      'estagio',
      'vaga',
      'clt',
      'pj',
    ];

    for (const label of issue.labels || []) {
      const name = label.name;
      if (!ignoreWords.includes(name.toLowerCase())) {
        list.push(name);
      }
    }

    return list.length > 0 ? list.join(', ') : null;
  }

  private detectLocation(issue: any, modality: string | null): string | null {
    const brackets = issue.title.match(/\[([^\]]+)\]/g);
    if (brackets) {
      for (const bracket of brackets) {
        const val = bracket.replace(/[\[\]]/g, '').trim();
        if (
          val.toLowerCase() !== 'remoto' &&
          val.toLowerCase() !== 'hibrido' &&
          val.toLowerCase() !== 'híbrido' &&
          val.toLowerCase() !== 'presencial'
        ) {
          return val;
        }
      }
    }
    return modality === 'Remoto' ? 'Remoto' : 'Brasil';
  }

  private cleanMarkdown(md: string): string {
    return md
      .replace(/#+\s+/g, '')
      .replace(/\*\*|__/g, '')
      .replace(/\*|_/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/`{3,}[\s\S]*?`{3,}/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
