import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UITransaction } from "./types";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Money } from "../utils/money";
import React from "react";

interface TransactionGraphProps {
    transactions: UITransaction[];
}

interface DailyTotal {
    date: string;
    income: number;
    expenses: number;
    balance: number;
}

const TransactionGraph = React.memo(({ transactions: _transactions }: TransactionGraphProps) => {
    const transactions = _transactions.reverse();
    // Find first transaction for each account
    const firstTransactions = transactions.reduce((acc: { [key: string]: UITransaction }, curr) => {
        if (!acc[curr.accountId]) {
            acc[curr.accountId] = curr;
        }
        return acc;
    }, {});

    // Get balance at the start of the month
    let startBalance = Object.values(firstTransactions).reduce((acc, curr) => acc + curr.balance + curr.amount, 0) / 100;

    // Process transactions into daily totals
    const dailyTotals = transactions.reduce((acc: { [key: string]: DailyTotal }, curr) => {
        const date = curr.date;
        if (!acc[date]) {
            acc[date] = {
                date,
                income: 0,
                expenses: 0,
                balance: startBalance,
            };
        }

        if (curr.amount > 0) {
            acc[date].income += curr.amount / 100;
            startBalance += curr.amount / 100;
        } else {
            acc[date].expenses += Math.abs(curr.amount) / 100;
            startBalance -= Math.abs(curr.amount) / 100;
        }

        acc[date].balance = startBalance;
        return acc;
    }, {});

    const chartData = Object.values(dailyTotals).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 p-3 rounded border border-slate-700 shadow-lg">
                    <p className="text-slate-200 font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                        >
                            {entry.name}: {Money.format(entry.value * 100)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100">Transaction Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#475569" // slate-600
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8" // slate-400
                                tick={{ fill: '#94a3b8' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#4ade80" // green-400
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke="#f87171" // red-400
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="#60a5fa" // blue-400
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
});

TransactionGraph.displayName = 'TransactionGraph';

export { TransactionGraph };
