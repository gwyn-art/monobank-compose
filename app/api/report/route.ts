import { getCurrentMonthName, getMonthListFrom } from "@/app/utils/date";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

/**
 * Current year report.
 * @param request API request
 * @returns 
 */
export async function GET(request: Request) {
  const currentMonth = getCurrentMonthName();
  const monthList = getMonthListFrom(currentMonth);
  const transactions: Transaction[] = [];

  try {
    for (const month of monthList) {
      const data = await kv.get<Transaction[]>(month);

      if (data) {
        transactions.concat(data);
      } else {
        return  NextResponse.json({
          status: "error",
          error: `Fetch failed: no data for ${month}`,
        });
      }
    }
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: `Fetch failed: ${err}`,
    });
  }

  const debit = transactions.filter((tr) => tr.amount > 0);
  const credit = transactions.filter((tr) => tr.amount < 0);

  return NextResponse.json({ debit, credit });
}
