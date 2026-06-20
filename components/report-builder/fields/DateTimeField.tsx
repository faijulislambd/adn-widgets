"use client"

import { useState } from "react"
import { format, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatDateTimeDisplay } from "@/lib/date-utils"
import type { DateTimeField as DateTimeFieldType } from "@/types/report-builder"

export { formatDateTimeDisplay }

interface Props {
  field: DateTimeFieldType
  onChange: (updated: DateTimeFieldType) => void
}

export function DateTimeField({ field, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const currentDate = field.value && isValid(new Date(field.value)) ? new Date(field.value) : undefined

  const timeString = currentDate
    ? format(currentDate, "HH:mm")
    : ""

  function handleDateSelect(date: Date | undefined) {
    if (!date) return
    const existing = currentDate ?? new Date()
    date.setHours(existing.getHours(), existing.getMinutes(), 0, 0)
    onChange({ ...field, value: date.toISOString() })
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, m] = e.target.value.split(":").map(Number)
    const base = currentDate ? new Date(currentDate) : new Date()
    base.setHours(h ?? 0, m ?? 0, 0, 0)
    onChange({ ...field, value: base.toISOString() })
  }

  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !currentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? formatDateTimeDisplay(field.value) : "Pick date & time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
            />
            <div className="border-t p-3">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Time (HH:MM)</Label>
              <Input
                type="time"
                value={timeString}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
