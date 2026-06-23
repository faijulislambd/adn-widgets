import { getRenderData } from "@/lib/report-render-store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const entry = getRenderData(id)
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json({ data: entry.data, settings: entry.settings })
}
