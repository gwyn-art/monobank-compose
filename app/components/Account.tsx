import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Account {
    id: string;
    name: string;
    balance: number;
    type: string;
}

interface AccountsListProps {
    accounts: Account[];
}

export const AccountsList = ({ accounts }: AccountsListProps) => (
    <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
            <CardTitle className="text-slate-100">Accounts</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                {accounts.map(account => (
                    <div key={account.id} className="flex justify-between items-center p-2 bg-slate-800 rounded">
                        <div>
                            <div className="font-medium text-slate-100">{account.name}</div>
                            <div className="text-sm text-slate-400">{account.type}</div>
                        </div>
                        <div className="font-medium text-slate-100">
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);