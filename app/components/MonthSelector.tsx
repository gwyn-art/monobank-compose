"use client";

import { useRouter } from "next/navigation";
import { DateRangeKey, DateRangeTypeValue, getMonthNameFromNumber, getMonthNumberFromName, isMonthName } from "../utils/date";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthSelectorProps {
  dateRange: DateRangeTypeValue
}

export const MonthSelector = ({ dateRange }: MonthSelectorProps) => {
  const router = useRouter();

  return (
    <Select 
      value={isMonthName(dateRange) ? getMonthNumberFromName(dateRange).toString() : "not_selected"}
      onValueChange={(value) => {
        const month = parseInt(value);
        router.push(`/?${DateRangeKey}=${getMonthNameFromNumber(month)}`);
      }}
    >
      <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
        <SelectValue>
          {isMonthName(dateRange) ? dateRange : "Custom month"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-slate-800">
        <SelectItem value="not_selected">Custom month</SelectItem>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <SelectItem key={month} value={month.toString()}>
            {getMonthNameFromNumber(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};