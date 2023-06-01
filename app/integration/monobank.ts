import {
  DateRange,
  DateRangeTypeValue,
  currentMonth,
  forMonth,
  getMonthNumberFromName,
  last30Days,
} from "../utils/date";

const P1_MB_TOKEN = process.env.P1_MB_TOKEN || "";
const P2_MB_TOKEN = process.env.P2_MB_TOKEN || "";

const CACHE_TIME = 1000 * 60;

export namespace Monobank {
  const ClientCache = new Map<string, { client: Client; time: number }>();
  export const fetchClient = async (token: string): Promise<Client> => {
    const cached = ClientCache.get(token);
    console.log("🚀 ~ Cache info (date.now/cached.time):", Date.now(), cached?.time)
    
    if (cached && Date.now() - cached.time < CACHE_TIME) {
      console.log('return from cache:', cached.client)
      return cached.client;
    }

    const authHeader = { "X-Token": token };
    const mbClient: Client = await fetch(
      "https://api.monobank.ua/personal/client-info",
      { headers: authHeader, cache: 'no-store', next: { revalidate: 0 } }
    ).then((response) => response.json());

    console.log("return new:", mbClient)

    ClientCache.set(token, { client: mbClient, time: Date.now() });

    return mbClient;
  };

  export const getWhiteCard = (client: Client) => {
    return client.accounts.find((acc) => acc.type === "white");
  };

  export const fetchHistory = async (
    token: string,
    account: Account,
    dateRange: DateRangeTypeValue
  ): Promise<Transaction[]> => {
    const authHeader = { "X-Token": token };

    let dateRangeValue: DateRange;

    switch (dateRange) {
      case "LAST_30_DAYS":
        dateRangeValue = last30Days();
        break;
      case "CURRENT_MONTH":
        dateRangeValue = currentMonth();
        break;
      default:
        const monthNumber = getMonthNumberFromName(dateRange);
        dateRangeValue = forMonth(monthNumber);
        break;
    }

    return fetch(
      `https://api.monobank.ua/personal/statement/${account.id}/${dateRangeValue.from}/${dateRangeValue.to}`,
      { next: { revalidate: 600 }, headers: authHeader }
    ).then((resp) => resp.json());
  };

  export const filterTransactionBetween = (transactions: Transaction[]) =>
    transactions.filter(
      (tr1) =>
        !transactions.some(
          (tr2) => tr1.amount === tr2.amount * -1 && tr1.time === tr2.time
        )
    );

  export const complete = async (dateRange: DateRangeTypeValue) => {
    let transactions: Transaction[] = [];
    let P1WhiteCard: Account;
    let P2WhiteCard: Account;

    try {
      const RNClient = await fetchClient(P1_MB_TOKEN);
      const KKClient = await fetchClient(P2_MB_TOKEN);
      P1WhiteCard = getWhiteCard(RNClient)!;
      P2WhiteCard = getWhiteCard(KKClient)!;

      if (!P1WhiteCard || !P2WhiteCard) {
        throw new Error("White card not found.");
      }

      transactions =
        (await fetchHistory(P1_MB_TOKEN, P1WhiteCard, dateRange)) || [];
      transactions = filterTransactionBetween(
        transactions.concat(
          (await fetchHistory(P2_MB_TOKEN, P2WhiteCard, dateRange)) || []
        )
      ).sort((a, b) => b.time - a.time);
    } catch (err) {
      console.error(err);

      throw new Error("Could not fetch.");
    }

    const debit = transactions.filter((tr) => tr.amount > 0);
    const credit = transactions.filter((tr) => tr.amount < 0);

    return {
      p1Account: P1WhiteCard,
      p2Account: P2WhiteCard,
      transactions,
      debit,
      credit,
    };
  };
}
