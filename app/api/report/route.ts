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
  let transactions: Transaction[] = [];

  try {
    let promiseList = [];
    for (const month of monthList) {
      promiseList.push(kv.get<Transaction[]>(month));
    }

    const dataList = await Promise.all(promiseList);
    transactions = dataList.reduce((acc: Transaction[], data) => {
      return [...acc, ...(data ?? [])];
    }, [] as Transaction[]);

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
