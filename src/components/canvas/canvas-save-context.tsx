"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

const autosaveStorageKey = (projectId: string) =>
  `trace-autosave-enabled:${projectId}`;

type CanvasSaveContextValue = {
  projectId: string;
  status: CanvasSaveStatus;
  setStatus: (status: CanvasSaveStatus) => void;
  autosaveEnabled: boolean;
  setAutosaveEnabled: (enabled: boolean) => void;
};

const CanvasSaveContext = createContext<CanvasSaveContextValue | null>(null);

type CanvasSaveProviderProps = {
  projectId: string;
  children: ReactNode;
};

export function CanvasSaveProvider({
  projectId,
  children,
}: CanvasSaveProviderProps) {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");
  const [autosaveEnabled, setAutosaveEnabledState] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(autosaveStorageKey(projectId));
      if (stored === "false") {
        setAutosaveEnabledState(false);
      }
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
  }, [projectId]);

  const setAutosaveEnabled = useCallback(
    (enabled: boolean) => {
      setAutosaveEnabledState(enabled);
      try {
        localStorage.setItem(autosaveStorageKey(projectId), String(enabled));
      } catch {
        // ignore
      }
      if (!enabled) {
        setStatus("idle");
      }
    },
    [projectId]
  );

  const value = useMemo(
    () => ({
      projectId,
      status,
      setStatus,
      autosaveEnabled,
      setAutosaveEnabled,
    }),
    [projectId, status, autosaveEnabled, setAutosaveEnabled]
  );

  return (
    <CanvasSaveContext.Provider value={value}>
      {children}
    </CanvasSaveContext.Provider>
  );
}

export function useCanvasSaveContext(): CanvasSaveContextValue | null {
  return useContext(CanvasSaveContext);
}

export function useCanvasSaveStatus(): CanvasSaveStatus {
  const context = useContext(CanvasSaveContext);
  return context?.status ?? "idle";
}

/** Stable no-op when persistence is disabled outside a project room. */
export function useCanvasSaveStatusSetter(): (status: CanvasSaveStatus) => void {
  const context = useContext(CanvasSaveContext);
  return useCallback(
    (next: CanvasSaveStatus) => {
      context?.setStatus(next);
    },
    [context]
  );
}

export function useCanvasAutosaveEnabled(): {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
} {
  const context = useContext(CanvasSaveContext);
  return {
    enabled: context?.autosaveEnabled ?? true,
    setEnabled: context?.setAutosaveEnabled ?? (() => {}),
  };
}
