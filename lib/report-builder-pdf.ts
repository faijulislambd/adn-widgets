export async function downloadReportAsPDF(
  container: HTMLElement,
  filename = "incident-report.pdf"
): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ])

  const htmlEl = document.documentElement
  const wasDark = htmlEl.classList.contains("dark")
  if (wasDark) htmlEl.classList.remove("dark")

  // Two rAF cycles so the browser finishes any pending layout/paint from the
  // dark-mode class removal and the off-screen element being fully rendered.
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  )

  try {
    await document.fonts.ready

    // Collect all page divs in document order
    const pageDivs = Array.from(
      container.querySelectorAll<HTMLElement>("[data-pdf-page]")
    ).sort((a, b) => Number(a.dataset.pdfPage) - Number(b.dataset.pdfPage))

    // Fallback: capture entire container if no page divs found
    if (pageDivs.length === 0) pageDivs.push(container)

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    for (let i = 0; i < pageDivs.length; i++) {
      const pageEl = pageDivs[i]

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        // Pin exactly to the page div's rendered size (794 × 1123 px)
        width:  pageEl.offsetWidth,
        height: pageEl.offsetHeight,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.95)

      if (i > 0) pdf.addPage()
      // Fill the full A4 page — canvas aspect ratio matches A4 exactly
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297)
    }

    pdf.save(filename)
  } finally {
    if (wasDark) htmlEl.classList.add("dark")
  }
}
