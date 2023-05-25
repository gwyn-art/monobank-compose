type Client = {
  clientId: string;
  name: string;
  webHookUrl: string;
  permissions: string;
  accounts: Account[];
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
