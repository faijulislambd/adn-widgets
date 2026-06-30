type Input = {
  clientName: string;
  totalSMS: number;
};

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

export const groupCompanies = (data: Input[]) => {
  const companyMap = new Map<
    string,
    {
      company: string;
      users: string[];
      totalSMS: number;
    }
  >();

  for (const item of data) {
    const { company, user } = parseClient(item.clientName);
    const sms = Number(item.totalSMS.replace(/,/g, ""));

    if (!companyMap.has(company)) {
      companyMap.set(company, {
        company,
        users: user ? [user] : [],
        totalSMS: sms,
      });
      continue;
    }

    const existing = companyMap.get(company)!;

    existing.totalSMS += sms;

    // Prevent duplicate users
    if (user && !existing.users.includes(user)) {
      existing.users.push(user);
    }
  }

  return [...companyMap.values()].sort((a, b) => b.totalSMS - a.totalSMS);
};
