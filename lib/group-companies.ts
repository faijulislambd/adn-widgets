import type { GroupedCompany, TopClient } from "@/types";

const parseClient = (text: string) => {
  let balance = 0;
  let splitIndex = -1;

  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === ")") {
      balance++;
    } else if (text[i] === "(") {
      balance--;

      if (balance === 0) {
        splitIndex = i;
        break;
      }
    }
  }

  if (splitIndex === -1) {
    return {
      company: text.trim(),
      user: "",
    };
  }

  return {
    company: text.slice(0, splitIndex).trim(),
    user: text.slice(splitIndex + 1, -1).trim(),
  };
};

export const groupCompanies = (data: TopClient[]): GroupedCompany[] => {
  const companyMap = new Map<string, GroupedCompany>();

  for (const item of data) {
    const { company, user } = parseClient(item.clientName);
    const sms = Number(item.totalSMS);

    if (!companyMap.has(company)) {
      companyMap.set(company, {
        company,
        users: user ? [{ user, sms }] : [],
        totalSMS: sms,
      });
      continue;
    }

    const existing = companyMap.get(company)!;

    existing.totalSMS += sms;

    if (user) {
      const existingUser = existing.users.find((u) => u.user === user);
      if (existingUser) {
        existingUser.sms += sms;
      } else {
        existing.users.push({ user, sms });
      }
    }
  }

  return [...companyMap.values()].sort((a, b) => b.totalSMS - a.totalSMS);
};
