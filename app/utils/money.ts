import { LOCALE } from "./locale";

export namespace Money {
  export const format = (n: number, abs = true) =>
    moneyFormatter.format((abs ? Math.abs(n) : n) / 100);

  const moneyFormatter = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "UAH",
    currencyDisplay: 'narrowSymbol'
  });
}
