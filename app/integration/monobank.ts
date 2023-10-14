import {
  DateRangeTypeValue,
  forMonth,
  getMonthNumberFromName,
} from "../utils/date";

const P1_MB_TOKEN = process.env.P1_MB_TOKEN || "";
const P2_MB_TOKEN = process.env.P2_MB_TOKEN || "";

const CACHE_TIME = 1000 * 60;

export namespace Monobank {
  const ClientCache = new Map<string, { client: Client; time: number }>();
  export const fetchClient = async (token: string): Promise<Client> => {
    const cached = ClientCache.get(token);

    if (cached && Date.now() - cached.time < CACHE_TIME) {
      return cached.client;
    }

    const authHeader = { "X-Token": token };
    const mbClient: Client = await fetch(
      "https://api.monobank.ua/personal/client-info",
      { headers: authHeader, cache: "no-store", next: { revalidate: 0 } }
    ).then((response) => response.json());

    ClientCache.set(token, { client: mbClient, time: Date.now() });

    return mbClient;
  };

  export const getWhiteCard = (client: Client) => {
    return client.accounts?.find((acc) => acc.type === "white");
  };

  export const fetchHistory = async (
    token: string,
    account: Account,
    dateRange: DateRangeTypeValue
  ): Promise<Transaction[]> => {
    const authHeader = { "X-Token": token };

    const monthNumber = getMonthNumberFromName(dateRange);
    const dateRangeValue = forMonth(monthNumber);

    return fetch(
      `https://api.monobank.ua/personal/statement/${account.id}/${dateRangeValue.from}/${dateRangeValue.to}`,
      { next: { revalidate: 600 }, headers: authHeader }
    ).then((resp) => resp.json());
  };

  export const filterTransactionBetween = (transactions: Transaction[]) =>
    transactions.filter(
      (tr1) =>
        !transactions.some((tr2) => {
          const isTransactionBetweenAccounts =
            Math.abs(tr1.amount) === Math.abs(tr2.amount) &&
            Math.abs(tr1.time - tr2.time) < 100 &&
            tr1.id !== tr2.id;

          if (
            tr1.description?.toLowerCase().includes("руслан") ||
            tr2.description?.toLowerCase().includes("катерина")
          ) {
            console.log("ruslan/kateryna", tr1, tr2);
          }
          return isTransactionBetweenAccounts;
        })
    );

  export const complete = async (dateRange: DateRangeTypeValue) => {
    let transactions: Transaction[] = [];
    let P1WhiteCard: Account;
    let P2WhiteCard: Account;

    try {
      const [P1Client, P2Client] = await Promise.all([
        fetchClient(P1_MB_TOKEN),
        fetchClient(P2_MB_TOKEN),
      ]);
      P1WhiteCard = getWhiteCard(P1Client)!;
      P2WhiteCard = getWhiteCard(P2Client)!;

      if (!P1WhiteCard || !P2WhiteCard) {
        throw new Error("White card not found.");
      }

      const [transactions_1 = [], transactions_2 = []] = await Promise.all([
        fetchHistory(P1_MB_TOKEN, P1WhiteCard, dateRange),
        fetchHistory(P2_MB_TOKEN, P2WhiteCard, dateRange),
      ]);

      const allTransactions = [...transactions_1, ...transactions_2];

      transactions = filterTransactionBetween(allTransactions).sort(
        (a, b) => b.time - a.time
      );
    } catch (err) {
      throw new Error("Could not fetch: " + err);
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
