"use client";

import StatusCard from "@/components/daily-update/StatusCard";
import UpdateHeader from "@/components/daily-update/UpdateHeader";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, MessageSquareDashedIcon } from "lucide-react";
import { RiEnglishInput } from "react-icons/ri";
import { TbAlphabetBangla, TbCurrencyTaka } from "react-icons/tb";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

const CharacterCount = () => {
  const [characterCount, setCharacterCount] = useState(0);
  const [smsCount, setSmsCount] = useState(0);
  const [maskRate, setMaskRate] = useState(0);
  const [nonMaskRate, setNonMaskRate] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalMaskingCost, setTotalMaskingCost] = useState(0);
  const [totalNonMaskingCost, setTotalNonMaskingCost] = useState(0);

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
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Characters for 1 SMS"
            value={engSingleSmsCount}
            bgColor="bg-green-200"
            borderColor="border-green-600"
            textColor="text-green-600"
            icon={<RiEnglishInput className="size-6" />}
          />
          <StatusCard
            title="Characters for 1 SMS"
            value={banglaSingleSmsCount}
            bgColor="bg-blue-200"
            borderColor="border-blue-600"
            textColor="text-blue-600"
            icon={<TbAlphabetBangla className="size-6" />}
          />
          <StatusCard
            title="Characters for multiple SMS"
            value={engMultiSmsCount}
            bgColor="bg-green-200"
            borderColor="border-green-600"
            textColor="text-green-600"
            icon={<RiEnglishInput className="size-6" />}
          />
          <StatusCard
            title="Characters for multiple SMS"
            value={banglaMultiSmsCount}
            bgColor="bg-blue-200"
            borderColor="border-blue-600"
            textColor="text-blue-600"
            icon={<TbAlphabetBangla className="size-6" />}
          />
        </div>
        <div className="mb-4">
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
        <div className={characterCount > 0 ? "block" : "hidden"}>
          <UpdateHeader
            title="Message Cost Calculator"
            icon={<MessageSquareDashedIcon className="size-4" />}
          />
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field>
              <FieldLabel htmlFor="smsCount">Message Count</FieldLabel>
              <Input id="smsCount" type="text" value={smsCount} readOnly />
              <FieldDescription>
                Number of messages based on the character count.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="maskRate">Masking Rate</FieldLabel>
              <Input
                id="maskRate"
                type="text"
                placeholder="Masking Rate"
                onChange={(e) =>
                  setMaskRate(e.target.value ? parseFloat(e.target.value) : 0)
                }
              />
              <FieldDescription>Rate of Masking.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="nonMaskRate">Non Masking Rate</FieldLabel>
              <Input
                id="nonMaskRate"
                type="text"
                placeholder="Non Masking Rate"
                onChange={(e) =>
                  setNonMaskRate(
                    e.target.value ? parseFloat(e.target.value) : 0,
                  )
                }
              />
              <FieldDescription>Rate of Non Masking.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="totalContacts">
                Number of uploaded contacts
              </FieldLabel>
              <Input
                id="totalContacts"
                type="text"
                value={totalContacts}
                onChange={(e) =>
                  setTotalContacts(e.target.value ? Number(e.target.value) : 0)
                }
              />

              <FieldDescription>Uploaded Contact Count.</FieldDescription>
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatusCard
              title="Total Sent Messages"
              value={`${totalContacts * smsCount}`}
              bgColor="bg-green-200"
              borderColor="border-green-600"
              textColor="text-green-600"
              icon={<MessageSquare className="size-6" />}
            />
            <StatusCard
              title="Total Masking Cost"
              value={`${(totalContacts * smsCount * maskRate).toFixed(2)}`}
              bgColor="bg-blue-200"
              borderColor="border-blue-600"
              textColor="text-blue-600"
              icon={<TbCurrencyTaka className="size-6" />}
            />
            <StatusCard
              title="Total Non-Masking Cost"
              value={`${(totalContacts * smsCount * nonMaskRate).toFixed(2)}`}
              bgColor="bg-amber-200"
              borderColor="border-amber-600"
              textColor="text-amber-600"
              icon={<TbCurrencyTaka className="size-6" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCount;
