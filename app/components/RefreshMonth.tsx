"use client";

import { useState } from "react";
import { DateRangeTypeValue } from "../utils/date";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshMonthProps {
  dateRange: DateRangeTypeValue
}

export const RefreshMonth = ({ dateRange }: RefreshMonthProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await (
      await fetch(`/api/refresh?dateRange=${dateRange}`)
    ).json();
    

    if (res.status === "error") {
      setError(true);
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="border-slate-700 hover:bg-slate-800"
      onClick={handleClick}
      disabled={loading}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing...' : error ? 'Error' : 'Refresh'}
    </Button>
  );
};
