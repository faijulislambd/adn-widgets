import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FetchArgs } from "@reduxjs/toolkit/query/react";

// The REST API's own base origin — NOT the same as ADNSMS_URL used elsewhere
// (that one points at the scraped dashboard page and isn't client-safe
// anyway). This must be set as NEXT_PUBLIC_ so it's actually available in
// the browser, since these calls go straight from the client to ADNSMS.
const API_BASE_URL = process.env.NEXT_PUBLIC_ADNSMS_API_URL;

const smsApiEndpoints = {
  checkBalance: "/api/v1/secure/check-balance",
  checkCampaignStatus: "/api/v1/secure/campaign-status",
  checkSmsStatus: "/api/v1/secure/sms-status",
  sendSms: "/api/v1/secure/send-sms",
};

// The API key/secret used to test against ADNSMS's real API — entered once
// by whoever's using this internal tester tool via <ApiKeySecretInput />,
// which stores them under this exact key/shape. Kept in their own browser's
// localStorage, not baked into the app for every visitor.
function getStoredApiCredentials(): { apiKey: string; apiSecret: string } {
  if (typeof window === "undefined") return { apiKey: "", apiSecret: "" };

  try {
    const raw = window.localStorage.getItem("apiKeySecretSet");
    if (!raw) return { apiKey: "", apiSecret: "" };

    const parsed = JSON.parse(raw);
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      apiSecret: typeof parsed.secret === "string" ? parsed.secret : "",
    };
  } catch {
    return { apiKey: "", apiSecret: "" };
  }
}

export const smsApiSlice = createApi({
  reducerPath: "smsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    checkCampaignStatus: builder.query<unknown, string>({
      query: (campaignUid): FetchArgs => {
        const { apiKey, apiSecret } = getStoredApiCredentials();
        return {
          url: smsApiEndpoints.checkCampaignStatus,
          method: "POST",
          body: {
            apiKey,
            apiSecret,
            campaign_uid: campaignUid,
          },
        };
      },
    }),
  }),
});

export const { useLazyCheckCampaignStatusQuery } = smsApiSlice;
