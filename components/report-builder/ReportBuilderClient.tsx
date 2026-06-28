"use client"

import { useEffect, useRef, useState } from "react"
import {
  PlusIcon,
  Eye,
  Save,
  Upload,
  Download,
  FileJson,
  FileText,
  ChevronDown,
  Settings2,
  Loader2,
} from "lucide-react"
import { Accordion } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlatformSelector } from "./PlatformSelector"
import { AddGroupModal } from "./AddGroupModal"
import { GroupAccordionItem } from "./GroupAccordionItem"
import { ReportPreview } from "./preview/ReportPreview"
import { ReportSettingsModal } from "./ReportSettingsModal"
import { loadReport, saveReport, loadSettings, saveSettings } from "@/lib/report-builder-storage"
import { COMPANY_NAME, COMPANY_ADDRESS, TIMEZONE, DEFAULT_SETTINGS } from "@/lib/report-builder-config"
import { downloadReportAsJSON, parseReportJSON, readFileAsText, buildReportFilename } from "@/lib/report-builder-io"
import { downloadReportAsPDF } from "@/lib/report-builder-pdf"
import type { PlatformType, ReportGroup, ReportData, PredefinedGroupId, ReportSettings } from "@/types/report-builder"

export function ReportBuilderClient() {
  const [platform, setPlatform] = useState<PlatformType | null>(null)
  const [groups, setGroups] = useState<ReportGroup[]>([])
  const [openValues, setOpenValues] = useState<string[]>([])
  const [settings, setSettings] = useState<ReportSettings>(DEFAULT_SETTINGS)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [savedLabel, setSavedLabel] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const fileInputRef    = useRef<HTMLInputElement>(null)
  const previewPagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedSettings = loadSettings()
    if (storedSettings) setSettings(storedSettings)

    const stored = loadReport()
    if (stored) {
      setPlatform(stored.metadata.platform)
      setGroups(stored.groups)
      setOpenValues(stored.groups.map((g) => g.id))
    }
  }, [])

  function buildReportData(): ReportData {
    return {
      metadata: {
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        timezone: TIMEZONE,
        platform,
        generatedAt: new Date().toISOString(),
      },
      groups,
    }
  }

  function handleSave() {
    saveReport(buildReportData())
    setSavedLabel(true)
    setTimeout(() => setSavedLabel(false), 2000)
  }

  function handleSaveSettings(updated: ReportSettings) {
    setSettings(updated)
    saveSettings(updated)
  }

  function handleDownloadJSON() {
    const data = buildReportData()
    downloadReportAsJSON(data, buildReportFilename(data, "json"))
  }

  async function handleDownloadPDF() {
    if (pdfLoading) return
    setPdfLoading(true)
    try {
      const data = buildReportData()
      await downloadReportAsPDF(data, settings, buildReportFilename(data, "pdf"))
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleImportFile(file: File) {
    setImportError(null)
    try {
      const text = await readFileAsText(file)
      const parsed = parseReportJSON(text)
      if (!parsed) {
        setImportError("Invalid JSON file. Please upload a valid report export.")
        return
      }
      setPlatform(parsed.metadata.platform)
      setGroups(parsed.groups)
      setOpenValues(parsed.groups.map((g) => g.id))
      saveReport(parsed)
    } catch {
      setImportError("Failed to read file. Please try again.")
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImportFile(file)
    e.target.value = ""
  }

  function handleAddGroup(group: ReportGroup) {
    setGroups((prev) => [...prev, group])
    setOpenValues((prev) => [...prev, group.id])
  }

  function handleUpdateGroup(updated: ReportGroup) {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  function handleDeleteGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    setOpenValues((prev) => prev.filter((v) => v !== id))
  }

  function handleMoveGroup(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= groups.length) return
    const reordered = [...groups]
    ;[reordered[index], reordered[next]] = [reordered[next], reordered[index]]
    setGroups(reordered)
  }

  const usedPredefinedIds = groups
    .filter((g) => g.predefinedId)
    .map((g) => g.predefinedId as PredefinedGroupId)

  const reportData = buildReportData()

  return (
    <div className="space-y-5">
      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Platform Selector */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <PlatformSelector value={platform} onChange={setPlatform} />
      </div>

      {/* Import error */}
      {importError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {importError}
        </div>
      )}

      {/* Group Builder */}
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Report Groups
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="size-3.5" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-3.5" />
              Import JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
              <Save className="size-3.5" />
              {savedLabel ? "Saved!" : "Save"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5" disabled={pdfLoading}>
                  {pdfLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                  Export
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Download options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownloadJSON} className="gap-2 cursor-pointer">
                  <FileJson className="size-4 text-muted-foreground" />
                  Download as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 cursor-pointer" disabled={pdfLoading}>
                  <FileText className="size-4 text-muted-foreground" />
                  {pdfLoading ? "Generating PDF…" : "Download as PDF"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5">
              <Eye className="size-3.5" />
              Preview
            </Button>
            <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
              <PlusIcon className="size-3.5" />
              Add Group
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {groups.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-muted/10">
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No groups yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click{" "}
                <button onClick={() => setAddModalOpen(true)} className="text-primary hover:underline underline-offset-2 font-medium">
                  + Add Group
                </button>{" "}
                to build your report.
              </p>
            </div>
            <div className="border-t mx-6 mb-8" />
            <div className="pb-10 px-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Or restore from a previous export
              </p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                Import JSON File
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Import a previously exported{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">.json</code>{" "}
                file to restore your report data.
              </p>
            </div>
          </div>
        ) : (
          <Accordion type="multiple" value={openValues} onValueChange={setOpenValues}>
            {groups.map((group, idx) => (
              <GroupAccordionItem
                key={group.id}
                group={group}
                onUpdate={handleUpdateGroup}
                onDelete={() => handleDeleteGroup(group.id)}
                canMoveUp={idx > 0}
                canMoveDown={idx < groups.length - 1}
                onMoveUp={() => handleMoveGroup(idx, -1)}
                onMoveDown={() => handleMoveGroup(idx, 1)}
              />
            ))}
          </Accordion>
        )}
      </div>

      {/* Modals */}
      <ReportSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <AddGroupModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddGroup}
        usedPredefinedIds={usedPredefinedIds}
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        {/* max-w matches PDF page width (794px) + dialog padding (2×24px) */}
        <DialogContent className="max-w-[858px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Report Preview</DialogTitle>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 mr-8"
              >
                {pdfLoading
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <Download className="size-3.5" />}
                {pdfLoading ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </DialogHeader>
          {/* ref here so PDF captures exactly what the user sees */}
          <div ref={previewPagesRef} style={{ width: 794, maxWidth: "100%" }}>
            <ReportPreview data={reportData} settings={settings} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
