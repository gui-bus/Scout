export abstract class BaseCollector {
  protected maxAgeDays: number;
  protected limitDate: Date;

  constructor(maxAgeDays = 90) {
    this.maxAgeDays = maxAgeDays;
    this.limitDate = new Date();
    this.limitDate.setDate(this.limitDate.getDate() - maxAgeDays);
  }

  setLimitDate(date: Date): void {
    this.limitDate = new Date(date);
  }

  isDateWithinPeriod(publishedAt: Date | null): boolean {
    if (!publishedAt) return false;
    return new Date(publishedAt).getTime() >= this.limitDate.getTime();
  }

  isPageFullyOutdated(jobs: { publishedAt: Date | null }[]): boolean {
    const dates = jobs
      .map((j) => (j.publishedAt ? new Date(j.publishedAt).getTime() : null))
      .filter((t): t is number => t !== null);

    if (dates.length === 0) return false;
    return Math.max(...dates) < this.limitDate.getTime();
  }

  getMostRecentDate(jobs: { publishedAt: Date | null }[]): Date | null {
    const dates = jobs
      .map((j) => (j.publishedAt ? new Date(j.publishedAt).getTime() : null))
      .filter((t): t is number => t !== null);

    return dates.length > 0 ? new Date(Math.max(...dates)) : null;
  }

  abstract get source(): string;
  abstract get queryKey(): string;
  abstract collect(): Promise<any[]>;
}
