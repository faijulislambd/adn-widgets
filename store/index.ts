import { configureStore } from "@reduxjs/toolkit"

import passwordReducer from "@/store/password-slice"
import dailyReportReducer from "@/store/daily-report-slice"
import { smsApiSlice } from "@/store/sms-api-slice"

export const store = configureStore({
  reducer: {
    password: passwordReducer,
    dailyReport: dailyReportReducer,
    [smsApiSlice.reducerPath]: smsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(smsApiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
