"use client";

import { useState, useEffect } from "react";
import { getRelativeTime } from "@/shared/helpers/time-formatter";

interface TimeAgoProps {
  timestamp: string | Date;
  updateInterval?: number; // in seconds
  className?: string;
  lang?: string;
}

/**
 * TimeAgo component that displays a timestamp as a relative time (e.g., "14 mins ago")
 * and automatically updates at the specified interval.
 */
const TimeAgo = ({
  timestamp,
  updateInterval = 60, // Default to updating every minute
  className = "",
  lang = "en",
}: TimeAgoProps) => {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    // Initial calculation
    setTimeAgo(getRelativeTime(timestamp, lang));

    // Set up interval to update the relative time
    const intervalId = setInterval(() => {
      setTimeAgo(getRelativeTime(timestamp, lang));
    }, updateInterval * 1000); // Convert seconds to milliseconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [timestamp, updateInterval, lang]);

  return (
    <time
      dateTime={typeof timestamp === "string" ? timestamp : timestamp.toISOString()}
      className={className}
      title={new Date(timestamp).toLocaleString(lang)}
    >
      {timeAgo}
    </time>
  );
};

export default TimeAgo;

/**
 * Usage example:
 *
 * <TimeAgo timestamp="2025-05-06T03:52:54.236Z" />
 *
 * // With custom update interval (30 seconds)
 * <TimeAgo timestamp="2025-05-06T03:52:54.236Z" updateInterval={30} />
 *
 * // With custom styling
 * <TimeAgo timestamp="2025-05-06T03:52:54.236Z" className="text-gray-500 text-sm" />
 */
