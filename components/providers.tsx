"use client"

import { ThemeProvider } from "next-themes"
import { Provider as ReduxProvider } from "react-redux"

import { store } from "@/store"
import DailyReportSync from "@/components/DailyReportSync"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <DailyReportSync />
        {children}
      </ThemeProvider>
    </ReduxProvider>
  )
}
