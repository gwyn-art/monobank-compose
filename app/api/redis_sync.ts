import { kv } from "@vercel/kv";

export async function sync(key: string, transactions: Transaction[]) {
  try {
    await kv.set(key, transactions);

    return { status: "success", query: "", error: "" };
  } catch (error) {
    return {
      status: "error",
      query: "",
      error: error,
    };
  }
}
