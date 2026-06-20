import type { Metadata } from "next"
import "./globals.css"

import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Next shadcn Redux Starter",
  description: "Next.js boilerplate with shadcn UI, Redux, themes, and sidebar.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
