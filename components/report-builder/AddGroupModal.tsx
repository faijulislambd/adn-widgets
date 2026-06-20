"use client"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { PREDEFINED_GROUP_DEFS, CUSTOM_FIELD_TYPES, FIELD_TYPE_LABELS, buildPredefinedFields, buildCustomFields } from "@/lib/report-builder-config"
import type { ReportGroup, PredefinedGroupId, FieldType } from "@/types/report-builder"

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (group: ReportGroup) => void
  usedPredefinedIds: PredefinedGroupId[]
}

type Step = "choose" | "predefined" | "custom"

export function AddGroupModal({ open, onClose, onAdd, usedPredefinedIds }: Props) {
  const [step, setStep] = useState<Step>("choose")
  const [selectedPredefined, setSelectedPredefined] = useState<PredefinedGroupId | null>(null)
  const [customTitle, setCustomTitle] = useState("")
  const [customFields, setCustomFields] = useState<FieldType[]>([])

  function reset() {
    setStep("choose")
    setSelectedPredefined(null)
    setCustomTitle("")
    setCustomFields([])
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleSubmitPredefined() {
    if (!selectedPredefined) return
    const def = PREDEFINED_GROUP_DEFS.find((d) => d.id === selectedPredefined)!
    const group: ReportGroup = {
      id: crypto.randomUUID(),
      title: def.title,
      predefinedId: selectedPredefined,
      fields: buildPredefinedFields(selectedPredefined),
      isExpanded: true,
    }
    onAdd(group)
    handleClose()
  }

  function handleSubmitCustom() {
    if (!customTitle.trim() || customFields.length === 0) return
    const group: ReportGroup = {
      id: crypto.randomUUID(),
      title: customTitle.trim().toUpperCase(),
      fields: buildCustomFields(customFields),
      isExpanded: true,
    }
    onAdd(group)
    handleClose()
  }

  function toggleCustomField(type: FieldType) {
    setCustomFields((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    )
  }

  const availablePredefined = PREDEFINED_GROUP_DEFS.filter(
    (d) => !usedPredefinedIds.includes(d.id)
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle>Add Group</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <button
                onClick={() => setStep("predefined")}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center hover:border-primary hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">📋</span>
                <span className="text-sm font-medium">Select Predefined Group</span>
              </button>
              <button
                onClick={() => setStep("custom")}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center hover:border-primary hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">✏️</span>
                <span className="text-sm font-medium">Create Custom Group</span>
              </button>
            </div>
          </>
        )}

        {step === "predefined" && (
          <>
            <DialogHeader>
              <DialogTitle>Select Predefined Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {availablePredefined.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  All predefined groups have been added.
                </p>
              )}
              {availablePredefined.map((def) => (
                <button
                  key={def.id}
                  onClick={() => setSelectedPredefined(def.id)}
                  className={`w-full text-left rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                    selectedPredefined === def.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  }`}
                >
                  {def.title}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("choose")}>Back</Button>
              <Button onClick={handleSubmitPredefined} disabled={!selectedPredefined}>
                Add Group
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "custom" && (
          <>
            <DialogHeader>
              <DialogTitle>Create Custom Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Group Title</Label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter group title"
                />
              </div>
              <div className="space-y-2">
                <Label>Select Fields</Label>
                <div className="space-y-2">
                  {CUSTOM_FIELD_TYPES.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`field-${type}`}
                        checked={customFields.includes(type)}
                        onCheckedChange={() => toggleCustomField(type)}
                      />
                      <label htmlFor={`field-${type}`} className="text-sm cursor-pointer">
                        {FIELD_TYPE_LABELS[type]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("choose")}>Back</Button>
              <Button
                onClick={handleSubmitCustom}
                disabled={!customTitle.trim() || customFields.length === 0}
              >
                Create Group
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
