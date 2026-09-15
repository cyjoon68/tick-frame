import { useEffect, useRef, useState } from "react";
import { createSkeletonRow } from "@/entities/ticker";
import type {
  BindTickerFn,
  Instrument,
  LoadCatalogFn,
  TickerBinding,
  TickerRowState,
} from "@/entities/ticker";
import {
  POLL_GAP_MS,
  SCREEN_ERROR,
  SCREEN_IDLE,
  SCREEN_REFRESHING,
} from "@/shared/config";

type UseWatchlistBoardArgs = {
  loadCatalog: LoadCatalogFn;
  bindTicker: BindTickerFn;
};

export const useWatchlistBoard = ({
  loadCatalog,
  bindTicker,
}: UseWatchlistBoardArgs) => {
  const [status, setStatus] = useState(SCREEN_IDLE);
  const [error, setError] = useState<string | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [rows, setRows] = useState<Record<string, TickerRowState>>({});
  const runningRef = useRef(false);
  const sessionsRef = useRef<TickerBinding[]>([]);
  const instrumentsRef = useRef<Instrument[]>([]);

  useEffect(() => {
    instrumentsRef.current = instruments;
  }, [instruments]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const selected = await loadCatalog();
      if (cancelled) {
        return;
      }
      instrumentsRef.current = selected;
      setInstruments(selected);
      setRows(
        Object.fromEntries(
          selected.map((item) => [item.code, createSkeletonRow(item)]),
        ),
      );
    };
    load().catch((err: Error) => {
      if (!cancelled) {
        setError(err.message);
        setStatus(SCREEN_ERROR);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadCatalog]);

  const stop = () => {
    runningRef.current = false;
    sessionsRef.current.forEach((session) => session.stop());
    sessionsRef.current = [];
    setStatus((current) =>
      current === SCREEN_REFRESHING ? SCREEN_IDLE : current,
    );
  };

  const refresh = async () => {
    if (runningRef.current) {
      return;
    }
    const list = instrumentsRef.current;
    if (list.length === 0) {
      return;
    }
    runningRef.current = true;
    setError(null);
    setStatus(SCREEN_REFRESHING);
    const sessions = list.map((item) =>
      bindTicker(item.code, {
        tickSize: item.tickSize,
        onPatch: (patch) => {
          setRows((current) => ({
            ...current,
            [item.code]: { ...current[item.code], ...patch },
          }));
        },
        onError: (err) => {
          runningRef.current = false;
          setError(err.message);
          setStatus(SCREEN_ERROR);
        },
      }),
    );
    sessionsRef.current = sessions;
    while (runningRef.current) {
      await Promise.all(sessions.map((session) => session.pull()));
      if (!runningRef.current) {
        break;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, POLL_GAP_MS);
      });
    }
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      sessionsRef.current.forEach((session) => session.stop());
    };
  }, []);

  const ordered = instruments.map((item) => rows[item.code]).filter(Boolean);

  return { status, error, ordered, refresh, stop };
};
