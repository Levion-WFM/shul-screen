"use client";

import DisplayGuard from "./DisplayGuard";

export default function DisplayGuardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DisplayGuard
      onRefreshData={() => {
        // TODO: fetch fresh data from API when wired up
      }}
      refreshIntervalMs={5 * 60 * 1000}
    >
      {children}
    </DisplayGuard>
  );
}
