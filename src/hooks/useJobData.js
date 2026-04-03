import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { GVIZ_URL, parseGvizResponse } from "../lib/sheet";

/**
 * Refresh schedule:
 *  - 05:00–07:00 local time → every 15 minutes  (data is actively updating)
 *  - All other hours         → every 6 hours
 *  - Manual refresh          → always fetch immediately
 */
function shouldRefresh(fetchedAt) {
  if (!fetchedAt) return true;
  const age = Date.now() - new Date(fetchedAt).getTime();
  const hour = new Date().getHours();
  const ttl = hour >= 5 && hour < 7 ? 15 * 60_000 : 6 * 60 * 60_000;
  return age > ttl;
}

export function useJobData() {
  const [cache, setCache] = useLocalStorage("jd_cache", { data: [], fetchedAt: null });
  // "loading" = first ever load (no cache), "refreshing" = background update, "idle" = done
  const [status, setStatus] = useState(cache.data.length ? "idle" : "loading");
  const [error, setError] = useState(null);

  // Use a ref so the polling interval always sees the latest fetchedAt without re-creating the interval
  const fetchedAtRef = useRef(cache.fetchedAt);

  const doFetch = useCallback(
    async () => {
      setStatus((prev) => (prev === "loading" ? "loading" : "refreshing"));
      setError(null);
      try {
        const res = await fetch(GVIZ_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const data = parseGvizResponse(text);
        const fetchedAt = new Date().toISOString();
        fetchedAtRef.current = fetchedAt;
        setCache({ data, fetchedAt });
        setStatus("idle");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sheet.");
        setStatus("idle");
      }
    },
    [setCache]
  );

  // Always fetch fresh data on mount; cached data shows immediately while this runs
  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // Poll every 60 s; doFetch decides if data is actually stale
  useEffect(() => {
    const id = setInterval(() => {
      if (shouldRefresh(fetchedAtRef.current)) doFetch();
    }, 60_000);
    return () => clearInterval(id);
  }, [doFetch]);

  return {
    jobs: cache.data,
    status,
    error,
    lastFetchedAt: cache.fetchedAt,
    refresh: doFetch,
  };
}
