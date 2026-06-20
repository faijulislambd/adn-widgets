export async function downloadReportAsPDF(
  element: HTMLElement,
  filename = "incident-report.pdf"
): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ])

  const htmlEl = document.documentElement
  const wasDark = htmlEl.classList.contains("dark")
  if (wasDark) htmlEl.classList.remove("dark")

  // Let the browser repaint after class change before capturing
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  )

  try {
    await document.fonts.ready

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/jpeg", 0.95)

    // A4 at 96 dpi = 794 × 1123 px. We captured at exactly 794 CSS px wide.
    const A4_W_MM = 210
    const A4_H_MM = 297

    const imgWidthMm = A4_W_MM
    const imgHeightMm = (canvas.height / canvas.width) * A4_W_MM
    const totalPages = Math.ceil(imgHeightMm / A4_H_MM)

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()
      // Shift image up by one page height per page — PDF clips at page boundary
      pdf.addImage(imgData, "JPEG", 0, -i * A4_H_MM, imgWidthMm, imgHeightMm)
    }

    pdf.save(filename)
  } finally {
    if (wasDark) htmlEl.classList.add("dark")
  }
}
