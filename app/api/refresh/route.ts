import { DateRangeTypeValue, getCurrentMonthName } from "@/app/utils/date";
import { NextRequest, NextResponse } from "next/server";
import { sync } from "../redis_sync";
import { Monobank } from "@/app/integration/monobank";

const DateRangeKey = "dateRange";

export async function GET(request: NextRequest) {
  const month =
    request.nextUrl.searchParams.get(DateRangeKey) ?? getCurrentMonthName();

  try {
    const data = await Monobank.complete(month as DateRangeTypeValue);
    const syncStatus = await sync(month, data.transactions);

    if (syncStatus.status === "error") {
      console.log(
        "🚀 ~ file: route.ts:20 ~ GET ~ syncStatus.error:",
        syncStatus.error
      );
      return NextResponse.json({
        status: "error",
        error: "Sync failed: " + syncStatus.error,
      });
    }
  } catch (error) {
    console.log("🚀 ~ file: route.ts:22 ~ GET ~ error:", error);
    return NextResponse.json({
      status: "error",
      error: "Fetch failed: " + error,
    });
  }

  return NextResponse.json({
    status: "success",
  });
}
