import React, { createContext, useContext, useState, useCallback } from 'react';

type BadgeCounts = {
  tasks: number;
  notifications: number;
};

type BadgeContextType = {
  badges: BadgeCounts;
  setBadge: (tab: keyof BadgeCounts, count: number) => void;
  incrementBadge: (tab: keyof BadgeCounts) => void;
  clearBadge: (tab: keyof BadgeCounts) => void;
};

const BadgeContext = createContext<BadgeContextType | null>(null);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [badges, setBadges] = useState<BadgeCounts>({
    tasks: 3,
    notifications: 5,
  });

  const setBadge = useCallback((tab: keyof BadgeCounts, count: number) => {
    setBadges((prev) => ({ ...prev, [tab]: Math.max(0, count) }));
  }, []);

  const incrementBadge = useCallback((tab: keyof BadgeCounts) => {
    setBadges((prev) => ({ ...prev, [tab]: prev[tab] + 1 }));
  }, []);

  const clearBadge = useCallback((tab: keyof BadgeCounts) => {
    setBadges((prev) => ({ ...prev, [tab]: 0 }));
  }, []);

  return (
    <BadgeContext.Provider value={{ badges, setBadge, incrementBadge, clearBadge }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
}
