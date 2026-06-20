"use client"

import { formatDateTimeDisplay } from "@/lib/date-utils"
import { DEFAULT_SETTINGS } from "@/lib/report-builder-config"
import type { ReportData, ReportGroup, ReportField, ReportSettings } from "@/types/report-builder"

// Responsive SVG — width is controlled by the parent container
const DEFAULT_LOGO_SVG = `<svg viewBox="0 0 236 33" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block"><g clip-path="url(#rp-clip)"><path d="M26.595 11.537C23.64 11.537 21.261 9.176 21.261 6.242 21.261 3.309 18.883.948 15.928.948c-2.955 0-5.333 2.361-5.333 5.294 0 2.933-2.378 5.294-5.334 5.294C2.307 11.537 0 13.898 0 16.796c0 2.933 2.378 5.294 5.333 5.294 2.956 0 5.334-2.361 5.334-5.294 0-2.933 2.378-5.294 5.333-5.294 2.955 0 5.333 2.361 5.333 5.294 0 2.933 2.379 5.294 5.334 5.294 2.955 0 5.333-2.361 5.333-5.294-.072-2.898-2.45-5.259-5.405-5.259Z" fill="#01974D"/><path d="M16 22.09c-2.849 0-5.143 2.421-5.143 5.429C10.857 30.527 13.151 32.948 16 32.948c2.85 0 5.143-2.421 5.143-5.429C21.143 24.511 18.85 22.09 16 22.09Z" fill="#01974D"/><path d="M55.392 7.233C50.043 7.233 45.714 11.579 45.714 16.947v9.715h3.893V20.818h11.642v5.844h3.893V16.947c-.072-5.368-4.439-9.714-9.75-9.714Zm-5.821 9.714c0-3.214 2.62-5.843 5.821-5.843 3.201 0 5.821 2.629 5.821 5.843H49.57ZM76.572 7.233H66.857v19.43h9.715c5.368 0 9.714-4.338 9.714-9.696 0-5.395-4.382-9.733-9.714-9.733Zm0 15.528H70.729V11.097h5.843c3.214 0 5.843 2.625 5.843 5.832-.036 3.207-2.629 5.832-5.843 5.832ZM97.714 7.233C92.346 7.233 88 11.579 88 16.947v9.715h3.907V16.947c0-3.214 2.63-5.843 5.843-5.843 3.214 0 5.843 2.629 5.843 5.843v9.715h3.836V16.947c0-5.368-4.383-9.714-9.715-9.714ZM130.286 7.233H120.571v19.43h9.715c5.368 0 9.714-4.338 9.714-9.696 0-5.395-4.382-9.733-9.714-9.733Zm0 15.528H124.442V11.097h5.844c3.213 0 5.842 2.625 5.842 5.832-.036 3.207-2.629 5.832-5.842 5.832ZM145.714 7.233H141.714v19.43h4V7.233ZM148 16.966C148 22.324 152.218 26.662 157.429 26.662H166.857V14.997H157.429V18.898H163.1V22.798H157.429c-3.12 0-5.672-2.625-5.672-5.832 0-3.207 2.552-5.832 5.672-5.832H166.857V7.233H157.429C152.218 7.27 148 11.607 148 16.966ZM172.571 7.233H169.143v19.43h3.428V7.233ZM184.251 7.233C179.06 7.233 174.857 11.579 174.857 16.947v9.715h3.779V16.947c0-3.214 2.543-5.843 5.65-5.843s5.65 2.629 5.65 5.843v9.715h3.779V16.947c-.036-5.368-4.275-9.714-9.464-9.714ZM196 13.065V20.83C196 24.037 198.547 26.662 201.661 26.662H214.857V22.761H201.661c-1.026 0-1.875-.875-1.875-1.932V18.898H213.654V14.997H199.786V13.065c0-1.057.849-1.932 1.875-1.932H214.857V7.233H201.661C198.547 7.233 196 9.858 196 13.065ZM236 7.233H217.143V11.133H224.679V26.662H228.464V11.133H236V7.233Z" fill="#4D4D4F"/></g><defs><clipPath id="rp-clip"><rect width="236" height="32" fill="white" transform="translate(0 .948)"/></clipPath></defs></svg>`

interface Props {
  data: ReportData
  settings?: ReportSettings
  pdfMode?: boolean
}

function PreviewRichText({ html }: { html: string }) {
  if (!html || html === "<p></p>") return null
  return (
    <div
      className="prose prose-sm max-w-none text-[#1a1a1a]"
      style={{ color: "#1a1a1a" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function PreviewField({ field }: { field: ReportField }) {
  switch (field.type) {
    case "text-input":
      return (
        <div className="flex gap-2 text-sm">
          <span className="font-medium min-w-[180px] shrink-0" style={{ color: "#4b5563" }}>{field.label}:</span>
          <span style={{ color: "#1a1a1a" }}>{field.value || <em style={{ color: "#9ca3af" }}>—</em>}</span>
        </div>
      )
    case "select":
      return (
        <div className="flex gap-2 text-sm">
          <span className="font-medium min-w-[180px] shrink-0" style={{ color: "#4b5563" }}>{field.label}:</span>
          <span style={{ color: "#1a1a1a" }}>{field.value || <em style={{ color: "#9ca3af" }}>—</em>}</span>
        </div>
      )
    case "date-time":
      return (
        <div className="flex gap-2 text-sm">
          <span className="font-medium min-w-[180px] shrink-0" style={{ color: "#4b5563" }}>{field.label}:</span>
          <span style={{ color: "#1a1a1a" }}>
            {field.value ? formatDateTimeDisplay(field.value) : <em style={{ color: "#9ca3af" }}>—</em>}
          </span>
        </div>
      )
    case "rich-text":
      return <PreviewRichText html={field.value} />
    case "ordered-list":
      if (field.items.length === 0) return null
      return (
        <ol className="space-y-3 list-none pl-0">
          {field.items.map((item, idx) => (
            <li key={item.id} className="flex gap-3">
              <span className="font-semibold text-sm shrink-0" style={{ color: "#01974D" }}>{idx + 1}.</span>
              <div>
                {item.heading && <p className="font-medium text-sm" style={{ color: "#1a1a1a" }}>{item.heading}</p>}
                {item.description && <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>{item.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      )
    case "team-table":
      if (field.members.length === 0) return null
      return (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: "#4b5563" }}>Name</th>
              <th className="text-left py-2 pr-4 font-semibold" style={{ color: "#4b5563" }}>Position</th>
              <th className="text-left py-2 font-semibold" style={{ color: "#4b5563" }}>Role in Response</th>
            </tr>
          </thead>
          <tbody>
            {field.members.map((m, idx) => (
              <tr key={m.id} style={{ backgroundColor: idx % 2 !== 0 ? "#f9fafb" : "transparent" }}>
                <td className="py-2 pr-4" style={{ color: "#1a1a1a" }}>{m.name}</td>
                <td className="py-2 pr-4" style={{ color: "#1a1a1a" }}>{m.position}</td>
                <td className="py-2" style={{ color: "#1a1a1a" }}>{m.roleInResponse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
  }
}

function PreviewGroup({ group }: { group: ReportGroup }) {
  return (
    <div className="space-y-4">
      <div style={{ borderBottom: "2px solid #01974D", paddingBottom: "4px" }}>
        <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: "#01974D" }}>
          {group.title}
        </h2>
      </div>
      <div className="space-y-3 pl-1">
        {group.fields.map((field) => (
          <PreviewField key={field.id} field={field} />
        ))}
      </div>
    </div>
  )
}

export function ReportPreview({ data, settings, pdfMode = false }: Props) {
  const { metadata, groups } = data
  const s = settings ?? DEFAULT_SETTINGS

  const platformLabel = metadata.platform
    ? `Incident Report for ${metadata.platform}`
    : "Incident Report Form"

  const outerClass = pdfMode
    ? "bg-white"
    : "bg-white rounded-lg border shadow-sm overflow-hidden"

  return (
    <div className={outerClass} style={{ color: "#1a1a1a", fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-start justify-between px-8 pt-6 pb-4">
          {/* Logo */}
          <div style={{ width: s.logoWidth, flexShrink: 0 }}>
            {s.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logoDataUrl} alt="Company logo" style={{ width: "100%", height: "auto", display: "block" }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG }} />
            )}
          </div>

          {/* Company info */}
          <div className="text-right text-xs" style={{ color: "#6b7280", lineHeight: 1.6 }}>
            <p className="font-semibold" style={{ color: "#1a1a1a" }}>{s.companyName}</p>
            <p>{s.companyAddress}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#01974D" }}>
              {platformLabel}
            </p>
          </div>
        </div>

        {/* Title bar */}
        <div style={{ backgroundColor: "#f0faf5", borderTop: "1px solid #d1fae5", padding: "10px 0" }}>
          <h1 className="text-center text-base font-black tracking-widest uppercase" style={{ color: "#01974D" }}>
            Incident Report
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6 space-y-8">
        {groups.map((group) => (
          <PreviewGroup key={group.id} group={group} />
        ))}
        {groups.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: "#9ca3af" }}>
            No groups added yet. Add groups to generate the report.
          </p>
        )}
      </div>
    </div>
  )
}
