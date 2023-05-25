import { kv } from "@vercel/kv";
import { DateRangeForm } from "./components/DateRangeForm";
import { Monobank } from "./integration/monobank";
import styles from "./page.module.css";
import { DateRangeTypeValue, getCurrentMonthName } from "./utils/date";
import { RefreshMonth } from "./components/RefreshMonth";

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
  console.log("🚀 ~ file: page.tsx:22 ~ dateRange:", dateRange);

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

    if (!transactionsData) {
      return <main>Can&apos;t fetch bank history for this period.</main>;
    }

    transactions = transactionsData;
  } catch (err) {
    console.error(err);

    return <main>Can&apos;t fetch bank history.</main>;
  }

  const debit = transactions.filter((tr) => tr.amount > 0);
  const credit = transactions.filter((tr) => tr.amount < 0);

  return (
    <main className={styles.main}>
      <DateRangeForm dateRange={dateRange} />
      <RefreshMonth dateRange={dateRange} />
      <h2>
        Current balance:{" "}
        {moneyFormat(P1WhiteCard.balance + P2WhiteCard.balance)}
      </h2>
      <h2>Cashback</h2>
      <p>
        Total cashback:{" "}
        {moneyFormat(
          transactions.reduce((acc, tr) => acc + tr.cashbackAmount, 0)
        )}
      </p>
      <h2>
        Debit. Total:{" "}
        {moneyFormat(debit.reduce((acc, tr) => acc + tr.amount, 0))}
      </h2>
      {debit.map((tr) => (
        <Transaction key={tr.id} transaction={tr} />
      ))}
      <h2>
        Credit. Total:{" "}
        {moneyFormat(credit.reduce((acc, tr) => acc + tr.amount, 0))}
      </h2>
      {credit.map((tr) => (
        <Transaction key={tr.id} transaction={tr} />
      ))}
    </main>
  );
}

const Transaction: React.FC<{ transaction: Transaction }> = ({
  transaction: tr,
}) => {
  return (
    <div className={styles.transaction} key={tr.id}>
      <h3>Provider: {tr.description}</h3>
      <p>Amount: {moneyFormat(tr.amount)}</p>
      <p>Balance: {moneyFormat(tr.balance)}</p>
    </div>
  );
};

const moneyFormat = (n: number) => moneyFormatter.format(n / 100);

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "UAH",
});
