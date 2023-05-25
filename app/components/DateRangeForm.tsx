"use client";

import { useRouter } from "next/navigation";
import { DateRangeKey, DateRangeTypeValue, getMonthNameFromNumber, getMonthNumberFromName, isMonthName } from "../utils/date";


export const DateRangeForm: React.FC<{ dateRange: DateRangeTypeValue }> = ({
    dateRange,
  }) => {
    const router = useRouter();
  
    return (
      <form>
        {/* REMOVED FOR NOW */}
        {/* <input
          type="radio"
          id="last30Days"
          name="dateRange"
          value="LAST_30_DAYS"
          checked={dateRange === "LAST_30_DAYS"}
          onChange={() => {
            router.push(`/?${DateRangeKey}=LAST_30_DAYS`);
          }}
        />
        <label htmlFor="last30Days">Last 30 days</label>
        <input
          type="radio"
          id="currentMonth"
          name="dateRange"
          value="CURRENT_MONTH"
          checked={dateRange === "CURRENT_MONTH"}
          onChange={() => {
            router.push(`/?${DateRangeKey}=CURRENT_MONTH`);
          }}
        />
        <label htmlFor="currentMonth">Current month</label> */}
        <label htmlFor="customMonth">Custom month</label>
        <select
          name="month"
          id="customMonth"
          value={isMonthName(dateRange) ? getMonthNumberFromName(dateRange) : "not_selected"}
          onChange={(e) => {
            const month = parseInt(e.target.value);
            router.push(`/?${DateRangeKey}=${getMonthNameFromNumber(month)}`);
          }}
        >
          <option value="not_selected">Custom month</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option
              key={month}
              value={month}
            >
              {getMonthNameFromNumber(month)}
            </option>
          ))}
        </select>
      </form>
    );
  };