import type { MetlifeData } from "./metlife";

export type TopClient = { clientName: string; totalSMS: number };

export type DailySmsData = {
  success: number;
  failed: number;
  pending: number;
  topClients: TopClient[];
  maskSuccess: number;
  maskFailed: number;
  maskPending: number;
  nonmaskSuccess: number;
  nonmaskFailed: number;
  nonmaskPending: number;
};

export type DailyReportStatus =
  | "idle"
  | "loading"
  | "refreshing"
  | "ready"
  | "failed";

export type DailyReportState = {
  smsData: DailySmsData | null;
  metlifeData: MetlifeData | null;
  status: DailyReportStatus;
  error: string | null;
  lastFetchedAt: number | null;
};
