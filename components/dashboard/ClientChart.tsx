type CompanyData = {
  company: string;
  users?: { user: string; sms: number }[];
  totalSMS: number;
};

type UserData = {
  user: string;
  sms: number;
};

const ClientChart = ({ topClients }: { topClients: CompanyData[] }) => {
  const companyData = topClients.map((company: CompanyData) => ({
    company: company.company,
    sms: company.totalSMS,
  }));

  const usersData = topClients.flatMap((company: CompanyData) =>
    company.users?.map((user: UserData) => ({
      user: user.user,
      sms: user.sms,
    })),
  );
  return <div>ClientChart</div>;
};

export default ClientChart;
