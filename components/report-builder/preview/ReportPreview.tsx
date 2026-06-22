"use client"

import type React from "react"
import { type ReactNode, useRef, useLayoutEffect, useState } from "react"
import { formatDateTimeDisplay } from "@/lib/date-utils"
import { DEFAULT_SETTINGS } from "@/lib/report-builder-config"
import type {
  ReportData,
  ReportGroup,
  ReportField,
  ReportSettings,
} from "@/types/report-builder"

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green:       "#01974D",
  greenDark:   "#015C2F",
  greenMid:    "#0F6E56",
  greenLight:  "#E1F5EE",
  greenBorder: "#9FE1CB",
  greenFaint:  "#F4FAF7",
  cardBg:      "#F8F8F7",
  cardBorder:  "#E0DFD7",
  textDark:    "#2C2C2A",
  textMid:     "#5F5E5A",
  textMuted:   "#888780",
}

// ─── A4 page geometry ─────────────────────────────────────────────────────────
const A4_W_PX       = 794
const A4_H_PX       = Math.round(A4_W_PX * 297 / 210)  // 1123 px
const BODY_PAD      = 32                                  // horizontal body padding (each side)
const BODY_CONTENT_W = A4_W_PX - BODY_PAD * 2           // 730 px
const ITEM_GAP      = 14    // vertical gap appended after every item when packing

// Conservative available body-content height per page (with safety buffer)
const PAGE1_AVAIL      = 870   // page 1: full header + severity bar consumed
const PAGE_CONT_AVAIL  = 910   // page 2+: compact header + cont-strip consumed

// Estimated overhead for team-table split rendering
const TEAM_SPLIT_BOX_HEADER = 38   // box header row ("Response team members | Continued …")
const TEAM_SPLIT_HINT       = 30   // hint row at bottom of page-1 portion
const SEC_TITLE_EST         = 31   // SecTitle height + its marginBottom (9 px)
const TEAM_FIRST_OVERHEAD   = SEC_TITLE_EST + TEAM_SPLIT_BOX_HEADER + TEAM_SPLIT_HINT  // ~99 px
const TEAM_CONT_OVERHEAD    = SEC_TITLE_EST  // just the repeated SecTitle on next page

// ─── White ADN logo SVG ───────────────────────────────────────────────────────
const WHITE_LOGO_SVG = `<svg viewBox="0 0 236 33" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block"><path d="M26.5946 11.5368C23.6397 11.5368 21.2613 9.17568 21.2613 6.24216C21.2613 3.30864 18.8829 0.94751 15.9279 0.94751C12.973 0.94751 10.5946 3.30864 10.5946 6.24216C10.5946 9.17568 8.21623 11.5368 5.26126 11.5368C2.30631 11.5368 0 13.898 0 16.7957C0 19.7292 2.37838 22.0904 5.33333 22.0904C8.28829 22.0904 10.6667 19.7292 10.6667 16.7957C10.6667 13.8622 13.045 11.5011 16 11.5011C18.955 11.5011 21.3333 13.8622 21.3333 16.7957C21.3333 19.7292 23.7117 22.0904 26.6667 22.0904C29.6216 22.0904 32 19.7292 32 16.7957C31.9279 13.898 29.5495 11.5368 26.5946 11.5368Z" fill="white"/><path d="M16.0003 22.0903C13.1509 22.0903 10.8574 24.5112 10.8574 27.5189C10.8574 30.5266 13.1509 32.9475 16.0003 32.9475C18.8497 32.9475 21.1431 30.5266 21.1431 27.5189C21.1431 24.5112 18.8497 22.0903 16.0003 22.0903Z" fill="white"/><path d="M55.3918 7.23315C50.0435 7.23315 45.7139 11.579 45.7139 16.9474V26.6617H49.6068V20.8185H61.2493V26.6617H65.1424V16.9474C65.0699 11.579 60.7036 7.23315 55.3918 7.23315ZM49.5705 16.9474C49.5705 13.7337 52.19 11.1042 55.3918 11.1042C58.5933 11.1042 61.2133 13.7337 61.2133 16.9474H49.5705Z" fill="white"/><path d="M76.5717 7.23315H66.8574V26.6617H76.5717C81.9403 26.6617 86.286 22.324 86.286 16.9657C86.286 11.5709 81.9037 7.23315 76.5717 7.23315ZM76.5717 22.7614H70.7283V11.097H76.5717C79.7854 11.097 82.4151 13.7215 82.4151 16.9292C82.3786 20.1369 79.7854 22.7614 76.5717 22.7614Z" fill="white"/><path d="M97.7143 7.23315C92.3457 7.23315 88 11.579 88 16.9474V26.6617H91.9074V16.9474C91.9074 13.7337 94.5371 11.1042 97.7509 11.1042C100.965 11.1042 103.594 13.7337 103.594 16.9474V26.6617H107.429V16.9474C107.429 11.579 103.046 7.23315 97.7143 7.23315Z" fill="white"/><path d="M130.286 7.23315H120.571V26.6617H130.286C135.654 26.6617 140 22.324 140 16.9657C140 11.5709 135.618 7.23315 130.286 7.23315ZM130.286 22.7614H124.442V11.097H130.286C133.499 11.097 136.129 13.7215 136.129 16.9292C136.092 20.1369 133.499 22.7614 130.286 22.7614Z" fill="white"/><path d="M145.714 7.23315H141.714V26.6617H145.714V7.23315Z" fill="white"/><path d="M148 16.9657C148 22.324 152.218 26.6617 157.429 26.6617H166.857V14.9973H157.429V18.8976H163.1V22.7979H157.429C154.309 22.7979 151.757 20.1734 151.757 16.9657C151.757 13.758 154.309 11.1334 157.429 11.1334H166.857V7.23315H157.429C152.218 7.26961 148 11.6073 148 16.9657Z" fill="white"/><path d="M172.571 7.23315H169.143V26.6617H172.571V7.23315Z" fill="white"/><path d="M184.251 7.23315C179.06 7.23315 174.857 11.579 174.857 16.9474V26.6617H178.636V16.9474C178.636 13.7337 181.179 11.1042 184.286 11.1042C187.393 11.1042 189.936 13.7337 189.936 16.9474V26.6617H193.715V16.9474C193.679 11.579 189.441 7.23315 184.251 7.23315Z" fill="white"/><path d="M196 13.0654V20.8295C196 24.0372 198.547 26.6617 201.661 26.6617H214.857V22.7614H201.661C200.635 22.7614 199.786 21.8866 199.786 20.8295V18.8976H213.654V14.9973H199.786V13.0654C199.786 12.0083 200.635 11.1334 201.661 11.1334H214.857V7.23315H201.661C198.547 7.23315 196 9.85767 196 13.0654Z" fill="white"/><path d="M236 7.23315H217.143V11.1334H224.679V26.6617H228.464V11.1334H236V7.23315Z" fill="white"/></svg>`

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase()
}

function severityColor(level: string): string {
  switch (level.toLowerCase()) {
    case "critical": return "#DC2626"
    case "high":
    case "major":    return "#E85D00"
    case "medium":   return "#D97706"
    case "low":      return "#2563EB"
    default:         return "#6B7280"
  }
}

// ─── Primitive UI ─────────────────────────────────────────────────────────────
function SecTitle({ title, continued }: { title: string; continued?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
      <span style={{ fontSize: 10, color: C.green, lineHeight: 1 }}>◆</span>
      <span style={{ fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.textMuted, fontWeight: 500, whiteSpace: "nowrap" as const }}>
        {title}
      </span>
      {continued && (
        <span style={{ fontSize: 9, background: C.greenFaint, border: `0.5px solid ${C.greenBorder}`, color: C.greenMid, padding: "2px 7px", borderRadius: 3, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.05em", flexShrink: 0 }}>
          continued
        </span>
      )}
      <span style={{ flex: 1, height: 0.5, background: C.cardBorder }} />
    </div>
  )
}

function InfoCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: C.cardBg, border: `0.5px solid ${C.cardBorder}`, borderRadius: 6, padding: "11px 13px" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.textMuted, fontWeight: 500, marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: C.textDark, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Field renderers ──────────────────────────────────────────────────────────
const PROSE_STYLE: React.CSSProperties = { fontSize: 12.5, lineHeight: 1.6 }

function RichTextInner({ html, color }: { html: string; color: string }) {
  return (
    <div
      className="[&_p]:my-0 [&_p+p]:mt-2 [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0.5 [&_strong]:font-semibold [&_a]:text-inherit"
      style={{ ...PROSE_STYLE, color }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function FieldRichText({ html }: { html: string }) {
  if (!html || html === "<p></p>") return null
  return (
    <div style={{ background: C.cardBg, border: `0.5px solid ${C.cardBorder}`, borderRadius: 6, padding: "11px 13px" }}>
      <RichTextInner html={html} color={C.textMid} />
    </div>
  )
}

// Single timeline row — used in both whole and split rendering
function TimelineRow({ item }: { item: Extract<ReportField, { type: "ordered-list" }>["items"][number] }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: C.greenLight, border: `0.5px solid ${C.greenBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <span style={{ fontSize: 9, color: C.greenMid, fontWeight: 700, lineHeight: 1 }}>✓</span>
      </div>
      <div>
        {item.heading && (
          <div style={{ fontSize: 12, fontWeight: 500, color: C.textDark, marginBottom: 1 }}>
            {item.heading}
          </div>
        )}
        {item.description && (
          <div style={{ fontSize: 11.5, color: C.textMid, lineHeight: 1.5 }}>
            {item.description}
          </div>
        )}
      </div>
    </div>
  )
}

function FieldTimeline({ field }: { field: Extract<ReportField, { type: "ordered-list" }> }) {
  if (!field.items.length) return null
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {field.items.map(item => <TimelineRow key={item.id} item={item} />)}
    </div>
  )
}

// Single team member row — used in both whole and split rendering
function TeamMemberRow({ member }: { member: Extract<ReportField, { type: "team-table" }>["members"][number] }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 11,
      padding: "9px 13px",
      borderBottom: `0.5px solid ${C.cardBorder}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: C.greenLight, border: `0.5px solid ${C.greenBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 600, color: C.greenMid,
        flexShrink: 0, marginTop: 1, letterSpacing: "0.03em",
      }}>
        {initials(member.name)}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.textDark }}>{member.name}</span>
          {member.position && (
            <span style={{ fontSize: 10.5, color: C.green, fontWeight: 500 }}>{member.position}</span>
          )}
        </div>
        {member.roleInResponse && (
          <div style={{ fontSize: 11.5, color: C.textMid, lineHeight: 1.45, marginTop: 2 }}>
            {member.roleInResponse}
          </div>
        )}
      </div>
    </div>
  )
}

function FieldTeamList({ field }: { field: Extract<ReportField, { type: "team-table" }> }) {
  if (!field.members.length) return null
  return (
    <div style={{ border: `0.5px solid ${C.cardBorder}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {field.members.map(m => <TeamMemberRow key={m.id} member={m} />)}
        {/* Remove last child's border-bottom via internal hack: use wrapper */}
      </div>
    </div>
  )
}

function InfoCardGrid({ fields }: { fields: Array<Extract<ReportField, { type: "text-input" | "select" | "date-time" }>> }) {
  const cols = fields.length === 1 ? "1fr" : fields.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr"
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10 }}>
      {fields.map(f => {
        const val = f.type === "date-time"
          ? (f.value ? formatDateTimeDisplay(f.value) : null)
          : (f.value || null)
        return (
          <InfoCard key={f.id} label={f.label}>
            {val ?? <em style={{ color: "#B4B2A9", fontStyle: "italic", fontSize: 11.5 }}>—</em>}
          </InfoCard>
        )
      })}
    </div>
  )
}

type FieldRun =
  | { kind: "info-grid"; fields: Array<Extract<ReportField, { type: "text-input" | "select" | "date-time" }>> }
  | { kind: "single"; field: ReportField }

function splitIntoRuns(fields: ReportField[]): FieldRun[] {
  const runs: FieldRun[] = []
  let grid: Array<Extract<ReportField, { type: "text-input" | "select" | "date-time" }>> = []
  for (const f of fields) {
    if (f.type === "text-input" || f.type === "select" || f.type === "date-time") {
      grid.push(f as Extract<ReportField, { type: "text-input" | "select" | "date-time" }>)
    } else {
      if (grid.length) { runs.push({ kind: "info-grid", fields: grid }); grid = [] }
      runs.push({ kind: "single", field: f })
    }
  }
  if (grid.length) runs.push({ kind: "info-grid", fields: grid })
  return runs
}

function GenericFieldList({ fields }: { fields: ReportField[] }) {
  const runs = splitIntoRuns(fields)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {runs.map((run, i) => {
        if (run.kind === "info-grid") return <InfoCardGrid key={i} fields={run.fields} />
        const f = run.field
        if (f.type === "rich-text")    return <FieldRichText key={f.id} html={f.value} />
        if (f.type === "ordered-list") return <FieldTimeline key={f.id} field={f} />
        if (f.type === "team-table")   return <FieldTeamList key={f.id} field={f} />
        return null
      })}
    </div>
  )
}

// ─── Group section renderers ──────────────────────────────────────────────────
function IncidentClosureSection({ group }: { group: ReportGroup }) {
  const richField = group.fields.find(f => f.type === "rich-text") as Extract<ReportField, { type: "rich-text" }> | undefined
  const msg = richField?.value
    ?.replace(/<\/(p|li|div|br)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    || "Incident closed — all systems restored to normal operation"
  return (
    <div>
      <SecTitle title={group.title} />
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "9px 13px",
        background: "#EAF7F0", border: `0.5px solid ${C.greenBorder}`, borderRadius: 6,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: C.greenDark }}>{msg}</span>
      </div>
    </div>
  )
}

function LessonsLearnedSection({ group }: { group: ReportGroup }) {
  const richField = group.fields.find(f => f.type === "rich-text") as Extract<ReportField, { type: "rich-text" }> | undefined
  const otherFields = group.fields.filter(f => f.type !== "rich-text")
  return (
    <div>
      <SecTitle title={group.title} />
      {richField && richField.value && richField.value !== "<p></p>" && (
        <div style={{ background: C.cardBg, border: `0.5px solid ${C.cardBorder}`, borderRadius: 6, padding: "11px 13px" }}>
          <RichTextInner html={richField.value} color={C.textMid} />
        </div>
      )}
      {otherFields.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <GenericFieldList fields={otherFields} />
        </div>
      )}
    </div>
  )
}

function GenericSection({ group }: { group: ReportGroup }) {
  if (!group.fields.length) return null
  return (
    <div>
      <SecTitle title={group.title} />
      <GenericFieldList fields={group.fields} />
    </div>
  )
}

// ─── Split-box visual components ──────────────────────────────────────────────

// Team section — first N members on this page, rest continue on next
function TeamSplitFirst({ group, firstN, totalN }: { group: ReportGroup; firstN: number; totalN: number }) {
  const teamField = group.fields.find(f => f.type === "team-table") as Extract<ReportField, { type: "team-table" }> | undefined
  const remaining = totalN - firstN
  return (
    <div>
      <SecTitle title={group.title} />
      <div style={{
        border: `0.5px solid ${C.cardBorder}`,
        borderBottom: `1.5px dashed ${C.greenBorder}`,
        borderRadius: "6px 6px 0 0",
        overflow: "hidden",
      }}>
        {/* Box header */}
        <div style={{
          background: C.greenFaint, borderBottom: `0.5px solid ${C.cardBorder}`,
          padding: "7px 13px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: C.greenMid, fontWeight: 500 }}>
            Response team members
          </span>
          <span style={{ fontSize: 9.5, color: C.textMuted, fontStyle: "italic" }}>
            Continued on next page
          </span>
        </div>
        {/* First N members */}
        {teamField?.members.slice(0, firstN).map(m => <TeamMemberRow key={m.id} member={m} />)}
        {/* Split hint */}
        <div style={{
          background: C.cardBg, padding: "6px 13px",
          borderTop: `0.5px dashed ${C.greenBorder}`,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 10, color: C.textMuted, fontStyle: "italic" }}>
            ··· {remaining} more team member{remaining !== 1 ? "s" : ""} listed on next page
          </span>
        </div>
      </div>
    </div>
  )
}

// Team section — continuation of split, showing members from `fromN` onward
function TeamSplitCont({ group, fromN }: { group: ReportGroup; fromN: number }) {
  const teamField = group.fields.find(f => f.type === "team-table") as Extract<ReportField, { type: "team-table" }> | undefined
  return (
    <div>
      <SecTitle title={group.title} continued />
      <div style={{
        border: `0.5px solid ${C.cardBorder}`,
        borderTop: "none",
        borderRadius: "0 0 6px 6px",
        overflow: "hidden",
      }}>
        {teamField?.members.slice(fromN).map(m => <TeamMemberRow key={m.id} member={m} />)}
      </div>
    </div>
  )
}

// ─── Content & page-item types ────────────────────────────────────────────────

type ContentItem =
  | { key: string; kind: "desc";  text: string }
  | { key: string; kind: "extra"; fields: ReportField[] }
  | { key: string; kind: "group"; group: ReportGroup }

// What actually gets rendered on each page (after split computation)
type PageItem =
  | { type: "whole";      item: ContentItem }
  | { type: "team-first"; group: ReportGroup; firstN: number; totalN: number }
  | { type: "team-cont";  group: ReportGroup; fromN: number;  totalN: number }

function renderContentItem(item: ContentItem): ReactNode {
  if (item.kind === "desc") {
    return (
      <div style={{ background: C.greenFaint, borderLeft: `3px solid ${C.green}`, borderRadius: "0 6px 6px 0", padding: "12px 15px" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.greenDark, fontWeight: 500, marginBottom: 4 }}>
          Incident Description
        </div>
        <div style={{ fontSize: 12.5, color: C.textDark, lineHeight: 1.6 }}>{item.text}</div>
      </div>
    )
  }
  if (item.kind === "extra") return <GenericFieldList fields={item.fields} />
  const g = item.group
  if (g.predefinedId === "INCIDENT_CLOSURE")  return <IncidentClosureSection group={g} />
  if (g.predefinedId === "LESSONS_LEARNED")   return <LessonsLearnedSection group={g} />
  return <GenericSection group={g} />
}

function renderPageItem(pi: PageItem): ReactNode {
  if (pi.type === "whole")      return renderContentItem(pi.item)
  if (pi.type === "team-first") return <TeamSplitFirst group={pi.group} firstN={pi.firstN} totalN={pi.totalN} />
  if (pi.type === "team-cont")  return <TeamSplitCont group={pi.group} fromN={pi.fromN} />
  return null
}

// ─── Pagination with split-box support ───────────────────────────────────────

function computePages(
  items: ContentItem[],
  sectionH: Map<string, number>,
  memberH: Map<string, number[]>,  // itemKey → array of per-member heights
): PageItem[][] {
  if (!items.length) return [[]]

  const result: PageItem[][] = []
  let cur: PageItem[] = []
  let usedH = 0

  function avail() { return result.length === 0 ? PAGE1_AVAIL : PAGE_CONT_AVAIL }
  function flush() { if (cur.length) result.push(cur); cur = []; usedH = 0 }
  function push(pi: PageItem, h: number) { cur.push(pi); usedH += h }

  // Processing queue — either a content item or a pending team continuation
  type QueueItem =
    | { q: "content"; item: ContentItem }
    | { q: "team-cont"; group: ReportGroup; fromN: number; totalN: number; memberHeights: number[] }

  const queue: QueueItem[] = items.map(item => ({ q: "content" as const, item }))

  for (let qi = 0; qi < queue.length; qi++) {
    const entry = queue[qi]

    if (entry.q === "content") {
      const { item } = entry
      const h = sectionH.get(item.key) ?? 60

      if (cur.length > 0 && usedH + h + ITEM_GAP > avail()) {
        // Section doesn't fit — try to split if it has a team-table
        if (item.kind === "group") {
          const tf = item.group.fields.find(f => f.type === "team-table") as Extract<ReportField, { type: "team-table" }> | undefined
          const mH = tf ? (memberH.get(item.key) ?? []) : []

          if (tf && mH.length > 1) {
            const availForMembers = avail() - usedH - TEAM_FIRST_OVERHEAD - ITEM_GAP
            if (availForMembers > 0) {
              let fit = 0
              let cumH = 0
              for (let m = 0; m < mH.length; m++) {
                if (cumH + mH[m] > availForMembers) break
                cumH += mH[m]
                fit++
              }
              // Only split if at least 1 fits and it's not ALL of them
              if (fit >= 1 && fit < tf.members.length) {
                push({ type: "team-first", group: item.group, firstN: fit, totalN: tf.members.length }, avail() - usedH)
                flush()
                // Prepend the continuation to the queue (process next)
                queue.splice(qi + 1, 0, {
                  q: "team-cont",
                  group: item.group,
                  fromN: fit,
                  totalN: tf.members.length,
                  memberHeights: mH,
                })
                continue
              }
            }
          }
        }
        // Can't split — flush current page, start fresh with this item
        flush()
        push({ type: "whole", item }, h + ITEM_GAP)
      } else {
        push({ type: "whole", item }, h + ITEM_GAP)
      }
    } else {
      // team-cont: continuation of a split team section
      const { group, fromN, totalN, memberHeights } = entry
      const contMemberH = memberHeights.slice(fromN).reduce((a, b) => a + b, 0)
      const h = TEAM_CONT_OVERHEAD + contMemberH

      if (cur.length > 0 && usedH + h + ITEM_GAP > avail()) {
        // Continuation doesn't fit on current page — can we sub-split?
        const availForMembers = avail() - usedH - TEAM_FIRST_OVERHEAD - ITEM_GAP
        if (availForMembers > 0 && totalN - fromN > 1) {
          let fit = 0
          let cumH = 0
          for (let m = fromN; m < memberHeights.length; m++) {
            if (cumH + memberHeights[m] > availForMembers) break
            cumH += memberHeights[m]
            fit++
          }
          if (fit >= 1 && fit < totalN - fromN) {
            push({ type: "team-first", group, firstN: fromN + fit, totalN }, avail() - usedH)
            flush()
            queue.splice(qi + 1, 0, {
              q: "team-cont",
              group,
              fromN: fromN + fit,
              totalN,
              memberHeights,
            })
            continue
          }
        }
        // Move cont to next page
        flush()
        push({ type: "team-cont", group, fromN, totalN }, h + ITEM_GAP)
      } else {
        push({ type: "team-cont", group, fromN, totalN }, h + ITEM_GAP)
      }
    }
  }

  flush()
  return result.length ? result : [[]]
}

// ─── Page chrome ──────────────────────────────────────────────────────────────
interface MetaProps { s: ReportSettings; metadata: ReportData["metadata"] }

function FullHeader({ s, metadata }: MetaProps) {
  return (
    <div style={{ background: C.green, padding: "22px 32px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: s.logoWidth, flexShrink: 0 }}>
        {s.logoDataUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={s.logoDataUrl} alt="logo" style={{ width: "100%", height: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
          : <div dangerouslySetInnerHTML={{ __html: WHITE_LOGO_SVG }} />}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" as const, fontWeight: 500 }}>
          Incident Report
        </div>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, marginTop: 2 }}>
          {metadata.platform ? `${metadata.platform} Platform` : s.companyName}
        </div>
      </div>
    </div>
  )
}

function SeverityBar({ severityField, dateField, platformLabel }: {
  severityField?: Extract<ReportField, { type: "select" }>
  dateField?:     Extract<ReportField, { type: "date-time" }>
  platformLabel:  string
}) {
  return (
    <div style={{ background: C.greenDark, padding: "9px 32px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const, flexShrink: 0 }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
        Severity
      </span>
      {severityField?.value
        ? <span style={{ color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 3, letterSpacing: "0.06em", textTransform: "uppercase" as const, background: severityColor(severityField.value) }}>{severityField.value}</span>
        : <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontStyle: "italic" }}>—</span>}
      {platformLabel && (
        <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 3, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
          {platformLabel}
        </span>
      )}
      {dateField?.value && (
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <span style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Date &amp; Time</span>
          <strong style={{ color: "#fff", fontSize: 12, fontWeight: 500 }}>{formatDateTimeDisplay(dateField.value)}</strong>
        </div>
      )}
    </div>
  )
}

function CompactHeader({ s, metadata }: MetaProps) {
  return (
    <>
      <div style={{ background: C.green, padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 70, flexShrink: 0 }}>
          {s.logoDataUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={s.logoDataUrl} alt="logo" style={{ width: "100%", height: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
            : <div dangerouslySetInnerHTML={{ __html: WHITE_LOGO_SVG }} />}
        </div>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 500 }}>
          {metadata.platform ? `${metadata.platform} Platform` : s.companyName} · Continued
        </span>
      </div>
      <div style={{ background: C.greenFaint, borderBottom: `0.5px solid #C0DD97`, padding: "7px 32px", fontSize: 10.5, color: C.greenMid, fontWeight: 500, flexShrink: 0 }}>
        ↑ Continuing from previous page…
      </div>
    </>
  )
}

function PageFooter({ pageNum, totalPages, isLast, s, metadata }: MetaProps & { pageNum: number; totalPages: number; isLast: boolean }) {
  return (
    <div style={{ background: C.cardBg, borderTop: `0.5px solid ${C.cardBorder}`, padding: "11px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ fontSize: 10.5, color: C.textMuted }}>
        {s.companyName}&nbsp;·&nbsp;Confidential&nbsp;·&nbsp;
        {metadata.platform ? `${metadata.platform} Platform` : "Incident Report"}
        &nbsp;·&nbsp;Page {pageNum} of {totalPages}
        {!isLast && <>&nbsp;·&nbsp;<span style={{ color: C.green, fontWeight: 500 }}>Continued →</span></>}
      </div>
      {isLast && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 90, height: 0.5, background: "#B4B2A9" }} />
          <span style={{ fontSize: 10, color: C.textMuted }}>Authorized signatory</span>
        </div>
      )}
    </div>
  )
}

function PageBreakVisual() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", userSelect: "none" as const }}>
      <div style={{ flex: 1, borderTop: "1.5px dashed #CBD5E1" }} />
      <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, letterSpacing: "0.04em" }}>✂&nbsp;&nbsp;Page break</span>
      <div style={{ flex: 1, borderTop: "1.5px dashed #CBD5E1" }} />
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface Props { data: ReportData; settings?: ReportSettings; pdfMode?: boolean }

export function ReportPreview({ data, settings, pdfMode = false }: Props) {
  const { metadata, groups } = data
  const s = settings ?? DEFAULT_SETTINGS

  const detailsGroup  = groups.find(g => g.predefinedId === "INCIDENT_DETAILS")
  const bodyGroups    = groups.filter(g => g.predefinedId !== "INCIDENT_DETAILS")

  const severityField = detailsGroup?.fields.find(f => f.type === "select" && f.label.toLowerCase().includes("severity")) as Extract<ReportField, { type: "select" }> | undefined
  const dateField     = detailsGroup?.fields.find(f => f.type === "date-time") as Extract<ReportField, { type: "date-time" }> | undefined
  const descField     = detailsGroup?.fields.find(f => f.type === "text-input") as Extract<ReportField, { type: "text-input" }> | undefined
  const extraFields   = detailsGroup?.fields.filter(f => f !== severityField && f !== dateField && f !== descField) ?? []

  const platformLabel = metadata.platform ?? "SMS"

  // Build ordered content items
  const items: ContentItem[] = []
  if (descField?.value)  items.push({ key: "__desc__",  kind: "desc",  text: descField.value })
  if (extraFields.length) items.push({ key: "__extra__", kind: "extra", fields: extraFields })
  bodyGroups.forEach(g => items.push({ key: g.id, kind: "group", group: g }))

  // Pagination state
  const [pages, setPages] = useState<PageItem[][]>(() => [items.map(item => ({ type: "whole" as const, item }))])
  const measureRef   = useRef<HTMLDivElement>(null)
  const prevPagesKey = useRef<string>("")

  const itemsKey = items.map(i => i.key).join("|")

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return

    // Section heights (data-section attribute)
    const sectionH = new Map<string, number>()
    el.querySelectorAll<HTMLElement>("[data-section]").forEach(node => {
      sectionH.set(node.dataset.section!, node.getBoundingClientRect().height)
    })

    // Member heights (data-member attribute: "itemKey:memberId")
    const rawMemberH = new Map<string, number[]>()
    el.querySelectorAll<HTMLElement>("[data-member]").forEach(node => {
      const [ik] = node.dataset.member!.split(":")
      if (!rawMemberH.has(ik)) rawMemberH.set(ik, [])
      rawMemberH.get(ik)!.push(node.getBoundingClientRect().height)
    })

    const newPages = computePages(items, sectionH, rawMemberH)
    const newKey = newPages.map(p =>
      p.map(pi => pi.type === "whole" ? `w:${pi.item.key}` : pi.type === "team-first" ? `tf:${pi.group.id}:${pi.firstN}` : `tc:${pi.group.id}:${pi.fromN}`).join(",")
    ).join("|")

    if (newKey !== prevPagesKey.current) {
      prevPagesKey.current = newKey
      setPages(newPages)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey])

  const totalPages = pages.length || 1

  return (
    <>
      {/*
        Hidden measurement container — positioned way off-screen so it's never
        visible, but still in the DOM for accurate getBoundingClientRect() reads.
        position:fixed means it's always relative to the viewport, unaffected by
        any parent's overflow or transform.
      */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{ position: "fixed", left: -20000, top: 0, width: BODY_CONTENT_W, visibility: "hidden", pointerEvents: "none", zIndex: -9999 }}
      >
        {/* Section-level height measurement */}
        {items.map(item => (
          <div key={item.key} data-section={item.key}>
            {renderContentItem(item)}
          </div>
        ))}
        {/* Per-member height measurement for team groups that can split across pages */}
        {items.flatMap(item => {
          if (item.kind !== "group") return []
          const tf = item.group.fields.find(f => f.type === "team-table") as Extract<ReportField, { type: "team-table" }> | undefined
          if (!tf) return []
          return tf.members.map(m => (
            <div key={`${item.key}:${m.id}`} data-member={`${item.key}:${m.id}`}>
              <TeamMemberRow member={m} />
            </div>
          ))
        })}
      </div>

      {/* Paginated A4 pages */}
      <div>
        {pages.map((pageItems, pageIdx) => (
          <div key={pageIdx}>
            {pageIdx > 0 && !pdfMode && <PageBreakVisual />}
            <div
              data-pdf-page={String(pageIdx + 1)}
              style={{
                width: A4_W_PX,
                height: A4_H_PX,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                color: C.textDark,
                fontFamily: "inherit",
              }}
            >
              {/* Header area */}
              {pageIdx === 0 ? (
                <>
                  <FullHeader s={s} metadata={metadata} />
                  <SeverityBar severityField={severityField} dateField={dateField} platformLabel={platformLabel} />
                </>
              ) : (
                <CompactHeader s={s} metadata={metadata} />
              )}

              {/* Body */}
              <div style={{ flex: 1, padding: `22px ${BODY_PAD}px`, overflow: "hidden" }}>
                {pageItems.length === 0 && pageIdx === 0 && (
                  <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, paddingTop: 40 }}>
                    No groups added yet.
                  </p>
                )}
                {pageItems.map((pi, idx) => (
                  <div
                    key={
                      pi.type === "whole"      ? pi.item.key :
                      pi.type === "team-first" ? `tf:${pi.group.id}` :
                                                 `tc:${pi.group.id}`
                    }
                    style={{ marginBottom: idx < pageItems.length - 1 ? ITEM_GAP : 0 }}
                  >
                    {renderPageItem(pi)}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <PageFooter pageNum={pageIdx + 1} totalPages={totalPages} isLast={pageIdx === totalPages - 1} s={s} metadata={metadata} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
