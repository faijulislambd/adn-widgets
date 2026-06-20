"use client"

import { PLATFORMS } from "@/lib/report-builder-config"
import { cn } from "@/lib/utils"
import type { PlatformType } from "@/types/report-builder"

interface Props {
  value: PlatformType | null
  onChange: (platform: PlatformType) => void
}

export function PlatformSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        Which platform is this report for?
      </p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            onClick={() => onChange(platform)}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
              value === platform
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  )
}
