"use client"

import type { ReportField } from "@/types/report-builder"
import { TextInputField } from "./TextInputField"
import { SelectField } from "./SelectField"
import { DateTimeField } from "./DateTimeField"
import { RichTextField } from "./RichTextField"
import { OrderedListField } from "./OrderedListField"
import { TeamTableField } from "./TeamTableField"

interface Props {
  field: ReportField
  onChange: (updated: ReportField) => void
}

export function FieldRenderer({ field, onChange }: Props) {
  switch (field.type) {
    case "text-input":
      return <TextInputField field={field} onChange={onChange} />
    case "select":
      return <SelectField field={field} onChange={onChange} />
    case "date-time":
      return <DateTimeField field={field} onChange={onChange} />
    case "rich-text":
      return <RichTextField field={field} onChange={onChange} />
    case "ordered-list":
      return <OrderedListField field={field} onChange={onChange} />
    case "team-table":
      return <TeamTableField field={field} onChange={onChange} />
  }
}
