"use client"

import { ChevronUp, ChevronDown, Trash2 } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { FieldRenderer } from "./fields/FieldRenderer"
import type { ReportGroup, ReportField } from "@/types/report-builder"

interface Props {
  group: ReportGroup
  onUpdate: (updated: ReportGroup) => void
  onDelete: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

export function GroupAccordionItem({
  group,
  onUpdate,
  onDelete,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: Props) {
  function handleFieldChange(updated: ReportField) {
    onUpdate({
      ...group,
      fields: group.fields.map((f) => (f.id === updated.id ? updated : f)),
    })
  }

  return (
    <AccordionItem value={group.id} className="border rounded-lg px-4 mb-2 last:mb-0 shadow-sm">
      <div className="flex items-center gap-1">
        {/* Reorder controls */}
        <div className="flex flex-col gap-0 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-6 rounded-sm text-muted-foreground hover:text-foreground"
            disabled={!canMoveUp}
            onClick={(e) => { e.stopPropagation(); onMoveUp() }}
            tabIndex={-1}
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-6 rounded-sm text-muted-foreground hover:text-foreground"
            disabled={!canMoveDown}
            onClick={(e) => { e.stopPropagation(); onMoveDown() }}
            tabIndex={-1}
          >
            <ChevronDown className="size-3" />
          </Button>
        </div>

        <AccordionTrigger className="flex-1 hover:no-underline py-3">
          <span className="text-sm font-semibold tracking-wide">{group.title}</span>
        </AccordionTrigger>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <AccordionContent>
        <div className="space-y-5 pt-2 pb-1">
          {group.fields.map((field) => (
            <FieldRenderer key={field.id} field={field} onChange={handleFieldChange} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
