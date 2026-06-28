import { ReportBuilderClient } from "@/components/report-builder/ReportBuilderClient"

export default function ReportBuilderPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Report Builder</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Build and generate incident reports for your platform.
        </p>
      </div>
      <ReportBuilderClient />
    </>
  )
}
