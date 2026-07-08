export type MonthlySmsData = {
  success: string;
  failed: string;
  pending: string;
  topClients: { clientName: string; totalSMS: string }[];
};

export type MonthlyCacheEntry = {
  data: MonthlySmsData;
  cachedAt: number;
};
