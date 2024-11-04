export interface UITransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    balance: number;
    accountId: string;
    category: string;
    merchant: string;
    reference: string;
}
