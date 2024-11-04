"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Money } from '../utils/money';
import { UITransaction } from './types';
import { TransactionGraph } from './Graph';

interface TransactionsListProps {
    transactions: UITransaction[];
}

export const TransactionsList = ({
    transactions,
}: TransactionsListProps) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const toggleExpanded = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');

    const filteredTransactions = transactions.filter(transaction => {
        switch (filter) {
            case 'debit':
                return transaction.amount > 0;
            case 'credit':
                return transaction.amount < 0;
            default:
                return true;
        }
    });

    return (
        <>
            <TransactionGraph transactions={transactions} />
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <FilterButtons filter={filter} setFilter={setFilter} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredTransactions.map(transaction => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                isExpanded={expanded.has(transaction.id)}
                                onToggle={toggleExpanded}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

interface TransactionItemProps {
    transaction: UITransaction;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const TransactionItem = ({ transaction, isExpanded, onToggle }: TransactionItemProps) => (
    <div
        className="border border-slate-800 rounded p-3 cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => onToggle(transaction.id)}
    >
        <div className="flex justify-between items-center">
            <div>
                <div className="font-medium text-slate-100">{transaction.description}</div>
                <div className="text-sm text-slate-400">{transaction.date}</div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-medium ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {Money.format(transaction.amount)}
                </span>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
            </div>
        </div>

        {isExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-sm">
                <TransactionDetails
                    category={transaction.category}
                    merchant={transaction.merchant}
                    reference={transaction.reference}
                />
            </div>
        )}
    </div>
);

interface TransactionDetailsProps {
    category: string;
    merchant: string;
    reference: string;
}

export const TransactionDetails = ({ category, merchant, reference }: TransactionDetailsProps) => (
    <div className="grid grid-cols-2 gap-2">
        <div>
            <span className="text-slate-400">Category:</span>{' '}
            <span className="text-slate-300">{category}</span>
        </div>
        <div>
            <span className="text-slate-400">Merchant:</span>{' '}
            <span className="text-slate-300">{merchant}</span>
        </div>
        <div>
            <span className="text-slate-400">Reference:</span>{' '}
            <span className="text-slate-300">{reference}</span>
        </div>
    </div>
);

interface FilterButtonsProps {
    filter: 'all' | 'debit' | 'credit';
    setFilter: (filter: 'all' | 'debit' | 'credit') => void;
}

const FilterButtons = ({ filter, setFilter }: FilterButtonsProps) => (
    <div className="flex gap-2 mb-4">
        <button
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-slate-700' : 'bg-slate-800'}`}
            onClick={() => setFilter('all')}
        >
            All
        </button>
        <button
            className={`px-3 py-1 rounded ${filter === 'debit' ? 'bg-slate-700' : 'bg-slate-800'}`}
            onClick={() => setFilter('debit')}
        >
            Debits
        </button>
        <button
            className={`px-3 py-1 rounded ${filter === 'credit' ? 'bg-slate-700' : 'bg-slate-800'}`}
            onClick={() => setFilter('credit')}
        >
            Credits
        </button>
    </div>
);