import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { DailyReportState, DailySmsData, MetlifeData } from "@/types";

// Shared, app-wide "what the SMS dashboard looks like right now" state.
// Everything that displays ADNSMS/MetLife data (dashboard charts, the daily
// report page, the "last updated" badge) reads from here instead of each
// fetching independently — one fetch, every consumer stays in sync.

const initialState: DailyReportState = {
  smsData: null,
  metlifeData: null,
  status: "idle",
  error: null,
  lastFetchedAt: null,
};

// force=true bypasses the Redis cache and triggers a live scrape (used on
// first app load and whenever a user clicks a Refresh button). force=false
// just reads whatever's already cached (used for the background poll).
export const fetchDailyReport = createAsyncThunk(
  "dailyReport/fetch",
  async (force: boolean = false) => {
    const suffix = force ? "?force=true" : "";
    const [smsRes, metlifeRes] = await Promise.all([
      fetch(`/api/daily-report-data${suffix}`),
      fetch(`/api/metlife-report${suffix}`),
    ]);

    if (!smsRes.ok) throw new Error("Failed to fetch daily report data");
    if (!metlifeRes.ok) throw new Error("Failed to fetch metlife report data");

    const [smsJson, metlifeJson] = await Promise.all([
      smsRes.json(),
      metlifeRes.json(),
    ]);

    return {
      smsData: smsJson.smsData as DailySmsData,
      metlifeData: metlifeJson.metlifeData as MetlifeData,
      fetchedAt: (smsJson.cachedAt as number | undefined) ?? Date.now(),
    };
  },
);

const dailyReportSlice = createSlice({
  name: "dailyReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyReport.pending, (state) => {
        state.status = state.smsData ? "refreshing" : "loading";
        state.error = null;
      })
      .addCase(fetchDailyReport.fulfilled, (state, action) => {
        state.smsData = action.payload.smsData;
        state.metlifeData = action.payload.metlifeData;
        state.lastFetchedAt = action.payload.fetchedAt;
        state.status = "ready";
      })
      .addCase(fetchDailyReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch report data";
      });
  },
});

export default dailyReportSlice.reducer;

// Selectors — components import these instead of reaching into the raw
// state shape, so the internal shape can change without touching consumers.
export const selectDailyReport = (state: RootState) => state.dailyReport;
export const selectIsDailyReportLoading = (state: RootState) =>
  state.dailyReport.status === "loading";
export const selectIsDailyReportRefreshing = (state: RootState) =>
  state.dailyReport.status === "refreshing";
