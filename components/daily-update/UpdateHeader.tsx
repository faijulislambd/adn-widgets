const UpdateHeader = ({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) => {
  return (
    <div>
      <h1 className="text-base font-semibold capitalize tracking-tight mb-6 flex items-center gap-2">
        <div className="bg-green-200 h-8 w-8 inline-flex rounded-full border border-green-400 justify-center items-center text-green-600">
          {icon}
        </div>
        <div className="flex flex-col justify-between">
          <span>{title}</span>
          <div className="w-12 h-0.5 bg-green-500 rounded-md"></div>
        </div>
      </h1>
    </div>
  );
};

export default UpdateHeader;
