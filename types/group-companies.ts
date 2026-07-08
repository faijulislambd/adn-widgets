export type GroupedUser = { user: string; sms: number };

export type GroupedCompany = {
  company: string;
  users: GroupedUser[];
  totalSMS: number;
};
