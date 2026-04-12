"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * DisplayGuard — always-on TV hardening layer
 *
 * Handles: wake lock, midnight reload, data polling,
 * network recovery, visibility recovery, memory cleanup
 */

interface DisplayGuardProps {
  children: React.ReactNode;
  onRefreshData?: () => void;
  refreshIntervalMs?: number;
}

export default function DisplayGuard({
  children,
  onRefreshData,
  refreshIntervalMs = 5 * 60 * 1000, // 5 minutes default
}: DisplayGuardProps) {
  const [isOffline, setIsOffline] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const lastDateRef = useRef<string>(new Date().toDateString());
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Request wake lock to prevent screen sleep
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          // Re-acquire if released (e.g. tab went background)
          setTimeout(requestWakeLock, 1000);
        });
      }
    } catch {
      // Wake lock failed — not critical, TV usually stays on
    }
  }, []);

  // Schedule reload at midnight for fresh day data
  const scheduleMidnightReload = useCallback(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 30, 0); // 30 seconds past midnight
    const msUntilMidnight = midnight.getTime() - now.getTime();

    midnightTimerRef.current = setTimeout(() => {
      window.location.reload();
    }, msUntilMidnight);
  }, []);

  // Check if the date has changed (fallback for missed midnight reload)
  const checkDateChange = useCallback(() => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastDateRef.current) {
      lastDateRef.current = currentDate;
      window.location.reload();
    }
  }, []);

  // Main setup
  useEffect(() => {
    // 1. Wake lock
    requestWakeLock();

    // 2. Midnight reload
    scheduleMidnightReload();

    // 3. Data refresh polling
    if (onRefreshData) {
      refreshTimerRef.current = setInterval(() => {
        onRefreshData();
        checkDateChange(); // Also check date on each poll
      }, refreshIntervalMs);
    }

    // 4. Network status listeners
    const handleOnline = () => {
      setIsOffline(false);
      // Reload page when network returns to get fresh data
      setTimeout(() => window.location.reload(), 2000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    // 5. Visibility change — re-acquire wake lock & check date
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
        checkDateChange();
        onRefreshData?.();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 6. Catch unhandled errors — reload after 10s
    const handleError = () => {
      setTimeout(() => window.location.reload(), 10000);
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    // Cleanup
    return () => {
      wakeLockRef.current?.release();
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, [requestWakeLock, scheduleMidnightReload, checkDateChange, onRefreshData, refreshIntervalMs]);

  return (
    <>
      {children}

      {/* Offline indicator — subtle bar at bottom */}
      {isOffline && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 text-center py-1 text-xs font-bold"
          style={{
            background: "linear-gradient(180deg, #8b2225 0%, #5a1115 100%)",
            color: "#f5e6a3",
            borderTop: "1px solid #d4af37",
          }}
        >
          אין חיבור לאינטרנט — מציג נתונים אחרונים
        </div>
      )}
    </>
  );
}
