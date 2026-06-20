"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TextInputField as TextInputFieldType } from "@/types/report-builder"

interface Props {
  field: TextInputFieldType
  onChange: (updated: TextInputFieldType) => void
}

export function TextInputField({ field, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>{field.label}</Label>
      <Input
        id={field.id}
        value={field.value}
        onChange={(e) => onChange({ ...field, value: e.target.value })}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    </div>
  )
}
