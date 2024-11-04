import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "../utils/money";

interface CashbackProps {
    cashback: number;
}

export const Cashback = ({ cashback }: CashbackProps) => (
    <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
            <CardTitle className="text-slate-100">Cashback: {Money.format(cashback)}</CardTitle>
        </CardHeader>
    </Card>
);