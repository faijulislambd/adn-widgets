"use client"

import { PlusIcon, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { OrderedListField as OrderedListFieldType, OrderedListItem } from "@/types/report-builder"

interface Props {
  field: OrderedListFieldType
  onChange: (updated: OrderedListFieldType) => void
}

export function OrderedListField({ field, onChange }: Props) {
  function addItem() {
    const item: OrderedListItem = {
      id: crypto.randomUUID(),
      heading: "",
      description: "",
    }
    onChange({ ...field, items: [...field.items, item] })
  }

  function updateItem(id: string, patch: Partial<OrderedListItem>) {
    onChange({
      ...field,
      items: field.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    })
  }

  function deleteItem(id: string) {
    onChange({ ...field, items: field.items.filter((it) => it.id !== id) })
  }

  function moveItem(index: number, direction: -1 | 1) {
    const items = [...field.items]
    const target = index + direction
    if (target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
    onChange({ ...field, items })
  }

  return (
    <div className="space-y-3">
      {field.items.map((item, idx) => (
        <div key={item.id} className="rounded-md border bg-muted/20 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
            <div className="flex gap-1 ml-auto">
              <Button variant="ghost" size="icon" className="size-6" onClick={() => moveItem(idx, -1)} disabled={idx === 0}>
                <ChevronUp className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => moveItem(idx, 1)} disabled={idx === field.items.length - 1}>
                <ChevronDown className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Heading</Label>
            <Input
              value={item.heading}
              onChange={(e) => updateItem(item.id, { heading: e.target.value })}
              placeholder="Item heading"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={item.description}
              onChange={(e) => updateItem(item.id, { description: e.target.value })}
              placeholder="Item description"
              className="min-h-[60px] text-sm"
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5">
        <PlusIcon className="size-3.5" /> Add Item
      </Button>
    </div>
  )
}
