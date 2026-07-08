"use client";

import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

export type MessageCountInfo = {
  characterCount: number;
  smsCount: number;
  isBangla: boolean;
};

type MessageTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  onCountChange?: (info: MessageCountInfo) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  englishSingleLimit?: number;
  englishMultiLimit?: number;
  banglaSingleLimit?: number;
  banglaMultiLimit?: number;
};

const isBanglaMessage = (text: string) => {
  const banglaChars = (text.match(/[ঀ-৿]/g) || []).length;

  // Count only letters (Bangla + English)
  const letters = (text.match(/\p{L}/gu) || []).length;

  if (letters === 0) return false;

  return banglaChars / letters >= 0.3; // 30% or more Bangla
};

const countSegments = (
  length: number,
  singleLimit: number,
  multiLimit: number,
) => {
  if (length <= 0) return 0;
  if (length <= singleLimit) return 1;
  return Math.ceil((length - singleLimit) / multiLimit) + 1;
};

// Reusable message textarea with a live character/SMS-segment count shown
// underneath. Controlled (value/onChange), so it drops into any form; use
// onCountChange if the parent needs the computed counts too (e.g. for a
// cost calculator elsewhere on the page).
const MessageTextarea = ({
  value,
  onChange,
  onCountChange,
  placeholder = "Type your message here...",
  rows = 8,
  className,
  englishSingleLimit = 160,
  englishMultiLimit = 150,
  banglaSingleLimit = 70,
  banglaMultiLimit = 65,
}: MessageTextareaProps) => {
  const bangla = isBanglaMessage(value);
  const characterCount = value.length;
  const smsCount = bangla
    ? countSegments(characterCount, banglaSingleLimit, banglaMultiLimit)
    : countSegments(characterCount, englishSingleLimit, englishMultiLimit);

  useEffect(() => {
    onCountChange?.({ characterCount, smsCount, isBangla: bangla });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterCount, smsCount, bangla]);

  return (
    <div className={className}>
      <Textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
      {characterCount > 0 && (
        <p className="mt-4 text-lg font-semibold">
          {characterCount} CHARACTERS {smsCount}{" "}
          {smsCount > 1 ? "Messages" : "Message"}
        </p>
      )}
    </div>
  );
};

export default MessageTextarea;
