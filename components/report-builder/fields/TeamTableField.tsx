"use client"

import { PlusIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TeamTableField as TeamTableFieldType, TeamMember } from "@/types/report-builder"

interface Props {
  field: TeamTableFieldType
  onChange: (updated: TeamTableFieldType) => void
}

export function TeamTableField({ field, onChange }: Props) {
  function addRow() {
    const member: TeamMember = {
      id: crypto.randomUUID(),
      name: "",
      position: "",
      roleInResponse: "",
    }
    onChange({ ...field, members: [...field.members, member] })
  }

  function updateMember(id: string, patch: Partial<TeamMember>) {
    onChange({
      ...field,
      members: field.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })
  }

  function deleteRow(id: string) {
    onChange({ ...field, members: field.members.filter((m) => m.id !== id) })
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground w-[35%]">Name</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground w-[30%]">Position</th>
              <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground w-[30%]">Role in Response</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {field.members.map((member, idx) => (
              <tr key={member.id} className={idx % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="px-2 py-1.5">
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(member.id, { name: e.target.value })}
                    placeholder="Full name"
                    className="h-7 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:border-b focus-visible:rounded-none px-1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={member.position}
                    onChange={(e) => updateMember(member.id, { position: e.target.value })}
                    placeholder="Position"
                    className="h-7 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:border-b focus-visible:rounded-none px-1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={member.roleInResponse}
                    onChange={(e) => updateMember(member.id, { roleInResponse: e.target.value })}
                    placeholder="Role"
                    className="h-7 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:border-b focus-visible:rounded-none px-1"
                  />
                </td>
                <td className="px-1 py-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-destructive hover:text-destructive"
                    onClick={() => deleteRow(member.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </td>
              </tr>
            ))}
            {field.members.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-xs text-muted-foreground">
                  No team members added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <PlusIcon className="size-3.5" /> Add Row
      </Button>
    </div>
  )
}
