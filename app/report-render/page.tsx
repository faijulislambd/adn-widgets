"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ReportPreview } from "@/components/report-builder/preview/ReportPreview"
import type { ReportData, ReportSettings } from "@/types/report-builder"

interface RenderState {
  data: ReportData
  settings: ReportSettings
}

function ReportRenderContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [renderState, setRenderState] = useState<RenderState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Missing render id")
      return
    }
    fetch(`/api/report-data/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Data not found")
        return r.json()
      })
      .then(({ data, settings }) => setRenderState({ data, settings }))
      .catch(() => setError("Failed to load report data"))
  }, [id])

  if (error) return <div style={{ padding: 16, color: "red" }}>{error}</div>
  if (!renderState) return null

  return (
    <div style={{ background: "#fff" }}>
      <ReportPreview data={renderState.data} settings={renderState.settings} pdfMode />
    </div>
  )
}

export default function ReportRenderPage() {
  return (
    <Suspense>
      <ReportRenderContent />
    </Suspense>
  )
}
