"use client";

import moment from "moment";
import { Badge } from "../ui/badge";
import { useAppSelector } from "@/store/hooks";
import { selectDailyReport } from "@/store/daily-report-slice";

const DataLastUpdated = ({ className }: { className?: string }) => {
  const { lastFetchedAt } = useAppSelector(selectDailyReport);

  if (lastFetchedAt === null) return null;
  return (
    <Badge
      className={`${className} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`}
    >
      Last updated {moment(lastFetchedAt).format("h:mm A")}
    </Badge>
  );
};

export default DataLastUpdated;
