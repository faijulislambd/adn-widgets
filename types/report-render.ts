import type { ReportData, ReportSettings } from "./report-builder";

export type ReportRenderEntry = {
  data: ReportData;
  settings: ReportSettings;
  expiry: number;
};
