import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@vercel/postgres";
import { DateRangeTypeValue, getCurrentMonthName, getMonthListFrom } from "@/app/utils/date";
import { Monobank } from "@/app/integration/monobank";
import { NextResponse } from "next/server";
import { sync } from "../redis_sync";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET() {
  const currentMonthName = getCurrentMonthName();
  const monthList = getMonthListFrom(currentMonthName);
  const resObject: Record<string, number> = {};

  for (const month of monthList) {
    let data: { credit: Transaction[]; debit: Transaction[] };
    try {
      data = await Monobank.complete(month as DateRangeTypeValue);
    } catch (error) {
      return NextResponse.json({
        status: "error",
        error: "Fetch failed: " + error,
      });
    }

    const res = await sync(month, [...data.credit, ...data.debit]);
    resObject[month] = data.credit.length + data.debit.length;
    if (res.status === "error") {
      return NextResponse.json({
        status: "error",
        error: "Sync failed: " + res.error,
        query: res.query,
      });
    }

    await delay(60 * 1000)
  }

  return NextResponse.json({
    status: "success",
    res: resObject,
    synced: monthList,
  });
}
