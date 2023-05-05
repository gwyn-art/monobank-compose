import { NextResponse } from 'next/server'

const P1_MB_TOKEN = process.env.P1_MB_TOKEN || ''
const P2_MB_TOKEN = process.env.P2_MB_TOKEN || ''

type Transaction = {
  id: string;
  time: number;
  description: string;
  mcc: number;
  originalMcc: number;
  hold: boolean;
  amount: number;
  operationAmount: number;
  currencyCode: number;
  commissionRate: number;
  cashbackAmount: number;
  balance: number;
  comment: string;
  receiptId: string;
  invoiceId: string;
  counterEdrpou: string;
  counterIban: string;
  counterName: string;
};

type Account = {
  id: string;
  sendId: string;
  balance: number;
  creditLimit: number;
  type: "black" | "white";
  currencyCode: number;
  cashbackType: "UAH" | "USD" | "EUR" | "RUB";
  maskedPan: string[];
  iban: string;
};

type Jar = Record<string, never>;

type Client = {
  clientId: string;
  name: string;
  webHookUrl: string;
  permissions: string;
  accounts: Account[];
  jars: Jar[];
};

const fetchClient = async (token: string): Promise<Client> => {
  const authHeader = { 'X-Token': token }

  const mbClient: Client = await fetch('https://api.monobank.ua/personal/client-info', { next: { revalidate: 60 }, headers: authHeader })
    .then(response => response.json())

  return mbClient
}

const getWhiteCard = (client: Client) => {
  return client.accounts.find(acc => acc.type === 'white')
}

const fetchHistory = async (token: string, account: Account): Promise<Transaction[]> => {
  const authHeader = { 'X-Token': token }

  return fetch(`https://api.monobank.ua/personal/statement/${account.id}/${Date.now() - 2629800000}/${Date.now()}`, { next: { revalidate: 60 }, headers: authHeader }).then(resp => resp.json())
}

const filterTransactionBetween = (transactions: Transaction[]) =>
  transactions.filter(tr1 => !transactions.some(tr2 => tr1.amount === tr2.amount * -1 && tr1.time === tr2.time))

export async function GET(request: Request) {
  let transactions: Transaction[] = [];
  let P1WhiteCard: Account;
  let P2WhiteCard: Account;

  try {
    const RNClient = await fetchClient(P1_MB_TOKEN)
    const KKClient = await fetchClient(P2_MB_TOKEN)
    P1WhiteCard = getWhiteCard(RNClient)!
    P2WhiteCard = getWhiteCard(KKClient)!

    if (!P1WhiteCard || !P2WhiteCard) {
      return (
        'White card not found'
      )
    }

    transactions = await fetchHistory(P1_MB_TOKEN, P1WhiteCard) || []
    transactions = filterTransactionBetween(transactions.concat(await fetchHistory(P2_MB_TOKEN, P2WhiteCard) || []))
      .sort((a, b) => b.time - a.time)
  } catch (err) {
    console.error(err);

    return (
      'Could not fetch'
    )
  }

  const debit = transactions.filter(tr => tr.amount > 0)
  const credit = transactions.filter(tr => tr.amount < 0)

  return NextResponse.json({ debit, credit })
}
