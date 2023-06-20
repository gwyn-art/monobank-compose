import { kv } from "@vercel/kv";
import { DateRangeForm } from "./components/DateRangeForm";
import { Monobank } from "./integration/monobank";
import styles from "./page.module.css";
import { DateRangeTypeValue, getCurrentMonthName } from "./utils/date";
import { RefreshMonth } from "./components/RefreshMonth";
import TabMenu from "./components/TabMenu";
import { Money } from "./utils/money";
import { Transaction } from "./components/Transaction";
import { LOCALE } from "./utils/locale";

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
    <main className={styles.main}>
      <DateRangeForm dateRange={dateRange} />
      <RefreshMonth dateRange={dateRange} />
      <h2>
        Current balance:{" "}
        {Money.format(P1WhiteCard.balance + P2WhiteCard.balance)}
      </h2>
      <p>
        Ruslan balance: {Money.format(P1WhiteCard.balance)}
      </p>
      <p>
        Katya balance: {Money.format(P2WhiteCard.balance)}
      </p>
      <h2>Cashback</h2>
      <p>
        Total cashback:{" "}
        {Money.format(
          transactions.reduce((acc, tr) => acc + tr.cashbackAmount, 0)
        )}
      </p>
      <TabMenu
        tabs={[
          {
            title: "Credit",
            content: (
              <div>
                <h2>
                  Credit. Total:{" "}
                  {Money.format(credit.reduce((acc, tr) => acc + tr.amount, 0))}
                </h2>
                <TransactionList transactions={credit} />
              </div>
            ),
          },
          {
            title: "Debit",
            content: (
              <div role="tabpanel" id="tabpanel-debit">
                <h2>
                  Debit. Total:{" "}
                  {Money.format(debit.reduce((acc, tr) => acc + tr.amount, 0))}
                </h2>
                <TransactionList transactions={debit} />
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}

const TransactionList: React.FC<{ transactions: Transaction[] }> = ({
  transactions,
}) => {
  let prevDate: string | null = null;
  const transactionGroupDateIterator = (() => {
    let prevDate: string | null = null;

    const TransactionGroupDateIterator = (tr: Transaction) => {
      if (!prevDate) {
        prevDate = new Date(tr.time * 1000).toLocaleDateString(LOCALE, { dateStyle: 'long' });

        return <TransactionGroupTitle date={prevDate} />;
      }

      if (prevDate === new Date(tr.time * 1000).toLocaleDateString(LOCALE, { dateStyle: 'long' })) {
        return null;
      }

      prevDate = new Date(tr.time * 1000).toLocaleDateString(LOCALE, { dateStyle: 'long' });

      return <TransactionGroupTitle date={prevDate} />;
    };

    return TransactionGroupDateIterator;
  })();

  return (
    <>
      {transactions.map((tr) => (
        <>
          {transactionGroupDateIterator(tr)}
          <Transaction key={tr.id} transaction={tr} />
        </>
      ))}
    </>
  );
};

const TransactionGroupTitle: React.FC<{ date: string }> = ({ date }) => {
  return <h3>{date}</h3>;
};
