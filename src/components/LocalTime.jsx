"use client";

import { useEffect, useState } from "react";

export default function LocalTime({ zone, className = "" }) {
  const [now, setNow] = useState("");

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: zone,
    });

    let timer;
    const tick = () => {
      setNow(format.format(new Date()));
      timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };

    tick();
    return () => clearTimeout(timer);
  }, [zone]);

  return (
    <span className={className} suppressHydrationWarning>
      {now}
    </span>
  );
}
