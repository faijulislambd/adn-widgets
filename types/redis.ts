export type CacheSource = "cron" | "manual";

export type CachedReport<T> = {
  data: T;
  scrapedAt: number;
  source: CacheSource;
};
