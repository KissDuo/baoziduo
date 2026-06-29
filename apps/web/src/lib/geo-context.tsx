'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface GeoContextType {
  /** null = still loading, true = in China, false = outside China */
  isChina: boolean | null;
}

const GeoContext = createContext<GeoContextType>({ isChina: true });

export function useGeo() {
  return useContext(GeoContext);
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5201/api/v1';

export function GeoProvider({ children }: { children: ReactNode }) {
  // null = loading, true = confirmed China, false = outside China
  const [isChina, setIsChina] = useState<boolean | null>(null);

  useEffect(() => {
    // Check sessionStorage cache first (key includes API base so dev/prod don't conflict)
    const cacheKey = `geo:v2:${API_BASE}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { country, ts } = JSON.parse(cached);
        // Cache for 1 hour
        if (Date.now() - ts < 60 * 60 * 1000) {
          setIsChina(country === 'CN');
          return;
        }
      }
    } catch { /* ignore */ }

    // Fetch from server
    fetch(`${API_BASE}/geo`, { credentials: 'omit' })
      .then(res => res.json())
      .then(data => {
        const result = data.country === 'CN';
        setIsChina(result);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ country: data.country, ts: Date.now() }));
        } catch { /* ignore */ }
      })
      .catch(() => {
        // On error, stay as China (conservative)
        setIsChina(true);
      });
  }, []);

  return (
    <GeoContext.Provider value={{ isChina }}>
      {children}
    </GeoContext.Provider>
  );
}
