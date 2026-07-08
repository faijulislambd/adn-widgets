// The Telco SMS Consumption table has whatever columns ADNSMS's report
// shows — scraped generically by reading the table's own header row, so a
// row is just "whatever columns were present," not a fixed shape.
export type TelcoSmsRow = Record<string, string>;

export type TelcoSmsStatus = "idle" | "running" | "done" | "failed";

export type TelcoSmsStatusEntry = {
  status: TelcoSmsStatus;
  startDate: string;
  endDate: string;
  startedAt?: number;
  finishedAt?: number;
  rowCount?: number;
  error?: string;
};

export type TelcoSmsDataEntry = {
  rows: TelcoSmsRow[];
  startDate: string;
  endDate: string;
  scrapedAt: number;
};
