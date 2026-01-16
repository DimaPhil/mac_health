import { useEffect, useRef, useCallback } from "react";

export function usePolling(
  callback: () => Promise<void>,
  intervalMs: number,
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    savedCallback.current();

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}

export function useSystemPolling() {
  const { refreshAll } = useSystemStore();

  const refresh = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  // Poll every 3 seconds
  usePolling(refresh, 3000);
}

// Re-export store for convenience
import { useSystemStore } from "../store/systemStore";
export { useSystemStore };
