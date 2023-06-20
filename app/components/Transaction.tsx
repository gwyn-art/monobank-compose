"use client";

import { useState } from "react";
import { Money } from "../utils/money";

import styles from "./Transaction.module.css";
import { LOCALE } from "../utils/locale";

export const Transaction: React.FC<{ transaction: Transaction }> = ({
  transaction: tr,
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.transaction} key={tr.id}>
      <div
        className={styles.transactionBody}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <h3>{tr.description}</h3>
        <p>{Money.format(tr.amount)}</p>
      </div>
      <div hidden={!isOpen}>
        <p>Balance: {Money.format(tr.balance)}</p>
        <p className={styles.transactionTime}>
          <span>{new Date(tr.time * 1000).toLocaleString(LOCALE, { dateStyle: 'long', timeStyle: 'long'})}</span>
        </p>
      </div>
    </div>
  );
};
