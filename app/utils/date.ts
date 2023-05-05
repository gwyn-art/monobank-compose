export type DateRange = {
  from: number;
  to: number;
};

let dateNow = new Date();

const getTimeNow = () => {
  if (new Date().getTime() - dateNow.getTime() < 60000) {
    return dateNow;
  }

  dateNow = new Date();
  return dateNow;
};

export const last30Days = (): DateRange => {
  const now = getTimeNow();
  const to = now.getTime();
  const from = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 30
  ).getTime();
  return { from, to };
};

export const currentMonth = (): DateRange => {
  const now = new Date();
  const to = now.getTime();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return { from, to };
};

export const forMonth = (month: number): DateRange => {
  const now = new Date();
  const to = new Date(now.getFullYear(), month, 1).getTime();
  const from = new Date(now.getFullYear(), month - 1, 1).getTime();
  return { from, to };
};

export const DateRangeKey = "dateRange";

export const getMonthNumberFromName = (monthName: string) => {
  return new Date(`${monthName} 1, 2022`).getMonth() + 1;
};

export const getMonthNameFromNumber = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("en-US", { month: "long" }).toUpperCase();
};

export type DateRangeTypeValue =
  | "LAST_30_DAYS"
  | "CURRENT_MONTH"
  | "JANUARY"
  | "FEBRUARY"
  | "MARCH"
  | "APRIL"
  | "MAY"
  | "JUNE"
  | "JULY"
  | "AUGUST"
  | "SEPTEMBER"
  | "OCTOBER"
  | "NOVEMBER"
  | "DECEMBER";
