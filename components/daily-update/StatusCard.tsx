const StatusCard = ({
  title,
  value,
  bgColor,
  borderColor,
  textColor,
  icon,
}: {
  title: string;
  value: string | number;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
}) => {
  return (
    <div
      className={`flex flex-col items-center gap-y-2 justify-center w-full px-4 py-6 ${bgColor} rounded-lg shadow-md`}
    >
      <span
        className={`text-sm font-semibold uppercase text-center ${textColor}`}
      >
        {title}
      </span>
      <div
        className={` h-12 w-12 inline-flex rounded-full border ${borderColor} justify-center items-center ${textColor}`}
      >
        {icon}
      </div>
      <span className={`text-3xl font-semibold ${textColor}`}>{value}</span>
    </div>
  );
};

export default StatusCard;
