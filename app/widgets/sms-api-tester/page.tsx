import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SmsApiTesterPage = () => {
  const tabMenuItems = [
    {
      label: "Balance Checker",
      value: "balance-checker",
    },
    {
      label: "Campaign Status Check",
      value: "campaign-status-check",
    },
    {
      label: "SMS Status Check",
      value: "sms-status-check",
    },
    {
      label: "Send OTP",
      value: "send-otp",
    },
    {
      label: "Send Single SMS",
      value: "send-single-sms",
    },
    {
      label: "Send Bulk SMS",
      value: "send-bulk-sms",
    },
    {
      label: "Send Multibody SMS",
      value: "send-multibody-sms",
    },
  ];
  return (
    <Tabs defaultValue={tabMenuItems[0].value} orientation="vertical">
      <TabsList>
        {tabMenuItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={tabMenuItems[0].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[0].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[0].label} page.
        </p>
      </TabsContent>
      <TabsContent value={tabMenuItems[1].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[1].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[1].label} page.
        </p>
      </TabsContent>
      <TabsContent value={tabMenuItems[2].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[2].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[2].label} page.
        </p>
      </TabsContent>
      <TabsContent value={tabMenuItems[3].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[3].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[3].label} page.
        </p>
      </TabsContent>
      <TabsContent value={tabMenuItems[4].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[4].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[4].label} page.
        </p>
      </TabsContent>
      <TabsContent value={tabMenuItems[5].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[5].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[5].label} page.
        </p>
      </TabsContent>
      <TabsContent value={tabMenuItems[6].value} className="w-full">
        <h2 className="text-lg font-semibold">{tabMenuItems[6].label}</h2>
        <p className="text-sm text-muted-foreground">
          This is the {tabMenuItems[6].label} page.
        </p>
      </TabsContent>
    </Tabs>
  );
};

export default SmsApiTesterPage;
