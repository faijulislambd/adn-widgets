"use client"

import { useRef, useState } from "react"
import { Upload, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DEFAULT_SETTINGS } from "@/lib/report-builder-config"
import type { ReportSettings } from "@/types/report-builder"

interface Props {
  open: boolean
  onClose: () => void
  settings: ReportSettings
  onSave: (settings: ReportSettings) => void
}

async function resizeImageToDataUrl(file: File, maxDim = 600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1)
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/png"))
    }
    img.src = url
  })
}

export function ReportSettingsModal({ open, onClose, settings, onSave }: Props) {
  const [draft, setDraft] = useState<ReportSettings>(settings)
  const logoInputRef = useRef<HTMLInputElement>(null)

  function handleOpen(isOpen: boolean) {
    if (isOpen) setDraft(settings)
    if (!isOpen) onClose()
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImageToDataUrl(file)
    setDraft((d) => ({ ...d, logoDataUrl: dataUrl }))
    e.target.value = ""
  }

  function handleResetLogo() {
    setDraft((d) => ({ ...d, logoDataUrl: null, logoWidth: DEFAULT_SETTINGS.logoWidth }))
  }

  function handleSave() {
    onSave(draft)
    onClose()
  }

  const logoPreviewSrc = draft.logoDataUrl

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-1">
          {/* Logo section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Company Logo</h3>

            {/* Preview */}
            <div className="rounded-md border bg-muted/20 p-4 flex items-center justify-center min-h-[80px]">
              {logoPreviewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreviewSrc}
                  alt="Logo preview"
                  style={{ width: draft.logoWidth, maxHeight: 80, objectFit: "contain" }}
                />
              ) : (
                <svg
                  viewBox="0 0 236 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: draft.logoWidth, height: "auto" }}
                >
                  <path d="M26.595 11.537C23.64 11.537 21.261 9.176 21.261 6.242 21.261 3.309 18.883.948 15.928.948c-2.955 0-5.333 2.361-5.333 5.294 0 2.933-2.378 5.294-5.334 5.294C2.307 11.537 0 13.898 0 16.796c0 2.933 2.378 5.294 5.333 5.294 2.956 0 5.334-2.361 5.334-5.294 0-2.933 2.378-5.294 5.333-5.294 2.955 0 5.333 2.361 5.333 5.294 0 2.933 2.379 5.294 5.334 5.294 2.955 0 5.333-2.361 5.333-5.294-.072-2.898-2.45-5.259-5.405-5.259Z" fill="#01974D"/>
                  <path d="M16 22.09c-2.849 0-5.143 2.421-5.143 5.429C10.857 30.527 13.151 32.948 16 32.948c2.85 0 5.143-2.421 5.143-5.429C21.143 24.511 18.85 22.09 16 22.09Z" fill="#01974D"/>
                  <path d="M55.392 7.233C50.043 7.233 45.714 11.579 45.714 16.947v9.715h3.893V20.818h11.642v5.844h3.893V16.947c-.072-5.368-4.439-9.714-9.75-9.714Zm-5.821 9.714c0-3.214 2.62-5.843 5.821-5.843 3.201 0 5.821 2.629 5.821 5.843H49.57ZM76.572 7.233H66.857v19.43h9.715c5.368 0 9.714-4.338 9.714-9.696 0-5.395-4.382-9.733-9.714-9.733Zm0 15.528H70.729V11.097h5.843c3.214 0 5.843 2.625 5.843 5.832-.036 3.207-2.629 5.832-5.843 5.832ZM97.714 7.233C92.346 7.233 88 11.579 88 16.947v9.715h3.907V16.947c0-3.214 2.63-5.843 5.843-5.843 3.214 0 5.843 2.629 5.843 5.843v9.715h3.836V16.947c0-5.368-4.383-9.714-9.715-9.714ZM130.286 7.233H120.571v19.43h9.715c5.368 0 9.714-4.338 9.714-9.696 0-5.395-4.382-9.733-9.714-9.733Zm0 15.528H124.442V11.097h5.844c3.213 0 5.842 2.625 5.842 5.832-.036 3.207-2.629 5.832-5.842 5.832ZM145.714 7.233H141.714v19.43h4V7.233ZM148 16.966C148 22.324 152.218 26.662 157.429 26.662H166.857V14.997H157.429V18.898H163.1V22.798H157.429c-3.12 0-5.672-2.625-5.672-5.832 0-3.207 2.552-5.832 5.672-5.832H166.857V7.233H157.429C152.218 7.27 148 11.607 148 16.966ZM172.571 7.233H169.143v19.43h3.428V7.233ZM184.251 7.233C179.06 7.233 174.857 11.579 174.857 16.947v9.715h3.779V16.947c0-3.214 2.543-5.843 5.65-5.843s5.65 2.629 5.65 5.843v9.715h3.779V16.947c-.036-5.368-4.275-9.714-9.464-9.714ZM196 13.065V20.83C196 24.037 198.547 26.662 201.661 26.662H214.857V22.761H201.661c-1.026 0-1.875-.875-1.875-1.932V18.898H213.654V14.997H199.786V13.065c0-1.057.849-1.932 1.875-1.932H214.857V7.233H201.661C198.547 7.233 196 9.858 196 13.065ZM236 7.233H217.143V11.133H224.679V26.662H228.464V11.133H236V7.233Z" fill="#4D4D4F"/>
                </svg>
              )}
            </div>

            {/* Logo controls */}
            <div className="flex gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Upload Logo
              </Button>
              {draft.logoDataUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={handleResetLogo}
                >
                  <RotateCcw className="size-3.5" />
                  Reset to Default
                </Button>
              )}
            </div>

            {/* Logo width slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Logo Width</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{draft.logoWidth}px</span>
              </div>
              <input
                type="range"
                min={60}
                max={300}
                step={4}
                value={draft.logoWidth}
                onChange={(e) => setDraft((d) => ({ ...d, logoWidth: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>60px</span>
                <span>300px</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Company info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Company Information</h3>

            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input
                value={draft.companyName}
                onChange={(e) => setDraft((d) => ({ ...d, companyName: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Company Address</Label>
              <Textarea
                value={draft.companyAddress}
                onChange={(e) => setDraft((d) => ({ ...d, companyAddress: e.target.value }))}
                placeholder="Enter company address"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
