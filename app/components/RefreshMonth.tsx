"use client";

import { useState } from "react";
import { DateRangeTypeValue } from "../utils/date";

export const RefreshMonth: React.FC<{ dateRange: DateRangeTypeValue }> = ({
  dateRange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await (
      await fetch(`/api/refresh?dateRange=${dateRange}`)
    ).json();
    setLoading(false);
    console.log("🚀 ~ file: RefreshMonth.tsx:17 ~ handleClick ~ res:", res);

    if (res.status === "error") {
      setError(true);
      return;
    }

    window.location.reload();
  };

  return (
    <button onClick={handleClick} style={{ width: "200px", marginTop: "20px" }}>
      Refresh {loading ? "..." : ""} {error ? "Refresh error" : ""}
    </button>
  );
};
