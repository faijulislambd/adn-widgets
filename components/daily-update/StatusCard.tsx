const StatusCard = ({
  title,
  value,
  bgColor,
  textColor,
  icon,
}: {
  title: string;
  value: string | number;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center gap-y-2 justify-center w-full px-4 py-6 bg-white rounded-lg shadow-md">
      <span className={`text-lg font-bold uppercase text-${textColor}`}>
        {title}
      </span>
      <div
        className={`bg-${bgColor} h-12 w-12 inline-flex rounded-full border border-${bgColor} justify-center items-center text-${textColor}`}
      >
        {icon}
      </div>
      <span className={`text-lg font-semibold text-${textColor}`}>{value}</span>
    </div>
  );
};

export default StatusCard;
