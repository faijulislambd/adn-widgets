"use client";

import UpdateHeader from "@/components/daily-update/UpdateHeader";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareDashedIcon } from "lucide-react";
import { useState } from "react";

const CharacterCount = () => {
  const [characterCount, setCharacterCount] = useState(0);
  const [smsCount, setSmsCount] = useState(0);

  const engSingleSmsCount = parseInt(
    process.env.ADNSMS_ENGLISH_1_SMS_COUNT || "160",
  );
  const engMultiSmsCount = parseInt(
    process.env.ADNSMS_ENGLISH_MORE_SMS_COUNT || "150",
  );
  const banglaSingleSmsCount = parseInt(
    process.env.ADNSMS_BANGLA_1_SMS_COUNT || "70",
  );
  const banglaMultiSmsCount = parseInt(
    process.env.ADNSMS_BANGLA_MORE_SMS_COUNT || "65",
  );

  const isBanglaMessage = (text: string) => {
    const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).length;

    // Count only letters (Bangla + English)
    const letters = (text.match(/\p{L}/gu) || []).length;

    if (letters === 0) return false;

    return banglaChars / letters >= 0.3; // 30% or more Bangla
  };

  const handleCharacterCount = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const text = event.target.value;
    if (isBanglaMessage(text)) {
      if (text.length > 0 && text.length <= banglaSingleSmsCount) {
        setSmsCount(1);
      } else if (text.length > banglaSingleSmsCount) {
        setSmsCount(
          Math.ceil(
            (text.length - banglaSingleSmsCount) / banglaMultiSmsCount,
          ) + 1,
        );
      }
      console.log(text);
    } else {
      if (text.length > 0 && text.length <= engSingleSmsCount) {
        setSmsCount(1);
      } else if (text.length > engSingleSmsCount) {
        setSmsCount(
          Math.ceil((text.length - engSingleSmsCount) / engMultiSmsCount) + 1,
        );
      }
    }
    setCharacterCount(text.length);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Message Body Count
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Get the message length and sms count. Also there is a sms cost
        calculator.
      </p>
      <div className="mt-4 border rounded-xl p-6">
        <UpdateHeader
          title="Message Body Count"
          icon={<MessageSquareDashedIcon className="size-4" />}
        />
        <div className="mb-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"></div>

        <Textarea
          placeholder="Type your message here..."
          onChange={handleCharacterCount}
          rows={8}
        />
        {characterCount > 0 && (
          <p className="mt-4 text-lg font-semibold">
            {characterCount} CHARACTERS {smsCount}{" "}
            {smsCount > 1 ? "Messages" : "Message"}
          </p>
        )}
      </div>
    </div>
  );
};

export default CharacterCount;
