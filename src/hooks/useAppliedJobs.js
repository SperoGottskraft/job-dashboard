import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { jobKey } from "../lib/utils";

/**
 * Persists per-job "applied" state in localStorage.
 * Structure: { [jobKey]: { appliedAt: ISO string } }
 */
export function useAppliedJobs() {
  const [applied, setApplied] = useLocalStorage("jd_applied", {});

  const markApplied = useCallback(
    (job) => {
      const key = jobKey(job);
      setApplied((prev) => ({ ...prev, [key]: { appliedAt: new Date().toISOString() } }));
    },
    [setApplied]
  );

  const unmarkApplied = useCallback(
    (job) => {
      const key = jobKey(job);
      setApplied((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [setApplied]
  );

  const isApplied = useCallback((job) => !!applied[jobKey(job)], [applied]);
  const getAppliedAt = useCallback((job) => applied[jobKey(job)]?.appliedAt ?? null, [applied]);

  return {
    applied,
    appliedCount: Object.keys(applied).length,
    markApplied,
    unmarkApplied,
    isApplied,
    getAppliedAt,
  };
}
