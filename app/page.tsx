import { kv } from "@vercel/kv";
import { MonthSelector } from "./components/MonthSelector";
import { Monobank } from "./integration/monobank";
import { DateRangeTypeValue, getCurrentMonthName } from "./utils/date";
import { RefreshMonth } from "./components/RefreshMonth";
import { LOCALE } from "./utils/locale";
import { TransactionsList } from "./components/TransactionList";
import { TotalBalance } from "./components/TotalBalance";
import { AccountsList } from "./components/Account";
import { Cashback } from "./components/Cashback";

const P1_MB_TOKEN = process.env.P1_MB_TOKEN || "";
const P2_MB_TOKEN = process.env.P2_MB_TOKEN || "";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let transactions: Transaction[] = [];
  let P1WhiteCard: Account;
  let P2WhiteCard: Account;
  const dateRange =
    (searchParams.dateRange as DateRangeTypeValue) || getCurrentMonthName();

  try {
    const P1Account = Monobank.getWhiteCard(
      await Monobank.fetchClient(P1_MB_TOKEN)
    );
    const P2Account = Monobank.getWhiteCard(
      await Monobank.fetchClient(P2_MB_TOKEN)
    );

    if (!P1Account || !P2Account) {
      return <main>Can&apos;t fetch bank account.</main>;
    }

    P1WhiteCard = P1Account;
    P2WhiteCard = P2Account;

    const transactionsData = await kv.get<Transaction[]>(dateRange);

    transactions = transactionsData ?? [];
  } catch (err) {
    console.error(err);

    return <main>Can&apos;t fetch bank history.</main>;
  }

  const debit = transactions.filter((tr) => tr.amount > 0);
  const credit = transactions.filter((tr) => tr.amount < 0);

  return (
    <main className="p-4 max-w-4xl mx-auto space-y-4 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex justify-between items-center">
        <MonthSelector dateRange={dateRange} />
        <RefreshMonth dateRange={dateRange} />
      </div>
      <TotalBalance balance={P1WhiteCard.balance + P2WhiteCard.balance} />
      <AccountsList
        accounts={[
          {
            id: P1WhiteCard.id,
            name: 'Ruslan',
            balance: P1WhiteCard.balance,
            type: P1WhiteCard.type,
          },
          {
            id: P2WhiteCard.id,
            name: 'Katya',
            balance: P2WhiteCard.balance,
            type: P2WhiteCard.type,
          },
        ]}
      />
      <Cashback cashback={transactions.reduce((acc, tr) => acc + tr.cashbackAmount, 0)} />
      <TransactionsList transactions={transactions.map(t => ({
        ...t,
        id: t.id,
        date: new Date(t.time * 1000).toLocaleDateString(LOCALE, { dateStyle: 'long' }),
        category: t.description,
        merchant: t.mcc.toString(),
        reference: t.mcc.toString(),
      }))} />
    </main>
  );
}