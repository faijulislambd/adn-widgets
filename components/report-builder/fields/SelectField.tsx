"use client"

import { useState } from "react"
import { PlusIcon, Pencil, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { saveSelectOptions } from "@/lib/report-builder-storage"
import type { SelectField as SelectFieldType, SelectOption } from "@/types/report-builder"

interface Props {
  field: SelectFieldType
  onChange: (updated: SelectFieldType) => void
}

export function SelectField({ field, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<SelectOption | null>(null)
  const [newLabel, setNewLabel] = useState("")

  function handleAddOption() {
    if (!newLabel.trim()) return
    const opt: SelectOption = { id: crypto.randomUUID(), label: newLabel.trim() }
    const updated = { ...field, options: [...field.options, opt] }
    onChange(updated)
    saveSelectOptions(field.id, updated.options)
    setNewLabel("")
  }

  function handleEditOption() {
    if (!editingOption || !newLabel.trim()) return
    const updated = {
      ...field,
      options: field.options.map((o) =>
        o.id === editingOption.id ? { ...o, label: newLabel.trim() } : o
      ),
    }
    onChange(updated)
    saveSelectOptions(field.id, updated.options)
    setEditingOption(null)
    setNewLabel("")
  }

  function handleDeleteOption(id: string) {
    const updated = {
      ...field,
      options: field.options.filter((o) => o.id !== id),
      value: field.value === field.options.find((o) => o.id === id)?.label ? "" : field.value,
    }
    onChange(updated)
    saveSelectOptions(field.id, updated.options)
  }

  function startEdit(opt: SelectOption) {
    setEditingOption(opt)
    setNewLabel(opt.label)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-7 text-xs gap-1">
          <Pencil className="size-3" /> Manage Options
        </Button>
      </div>
      <Select value={field.value} onValueChange={(v) => onChange({ ...field, value: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.id} value={opt.label}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Options — {field.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Option label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editingOption) { handleEditOption() } else { handleAddOption() }
                  }
                }}
              />
              {editingOption ? (
                <>
                  <Button size="sm" onClick={handleEditOption}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingOption(null); setNewLabel("") }}>Cancel</Button>
                </>
              ) : (
                <Button size="sm" onClick={handleAddOption}>
                  <PlusIcon className="size-4" />
                </Button>
              )}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {field.options.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                  <span>{opt.label}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => startEdit(opt)}>
                      <Pencil className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive" onClick={() => handleDeleteOption(opt.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {field.options.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center">No options yet. Add one above.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
