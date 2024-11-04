import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money } from '../utils/money';

interface TotalBalanceProps {
  balance: number;
}

export const TotalBalance = ({ balance }: TotalBalanceProps) => (
  <Card className="bg-slate-900 border-slate-800">
    <CardHeader>
      <CardTitle className="text-slate-100">Total Balance</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-slate-100">
        {Money.format(balance)}
      </div>
    </CardContent>
  </Card>
);