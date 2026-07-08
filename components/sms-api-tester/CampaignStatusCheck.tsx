"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLazyCheckCampaignStatusQuery } from "@/store/sms-api-slice";

const CampaignStatusCheck = () => {
  const [campaignUid, setCampaignUid] = useState("");
  const [trigger, { data, isFetching, error }] =
    useLazyCheckCampaignStatusQuery();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!campaignUid.trim()) return;
    trigger(campaignUid.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <Field className="flex-1">
          <FieldLabel htmlFor="campaign_uid">Campaign UID</FieldLabel>
          <Input
            id="campaign_uid"
            value={campaignUid}
            onChange={(event) => setCampaignUid(event.target.value)}
            placeholder="Enter campaign UID"
          />
        </Field>
        <Button type="submit" disabled={isFetching || !campaignUid.trim()}>
          {isFetching ? "Checking..." : "Check Status"}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-destructive">
          Failed to check campaign status. Check your API credentials
          (localStorage key &quot;apiKeySecret&quot;) and the campaign UID.
        </p>
      )}

      {data !== undefined && (
        <pre className="rounded-md border bg-muted p-4 text-sm overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CampaignStatusCheck;
