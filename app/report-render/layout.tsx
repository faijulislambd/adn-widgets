// Minimal layout — no nav, no theme, just the raw page so Puppeteer gets clean HTML
export default function ReportRenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#fff" }}>{children}</body>
    </html>
  )
}
