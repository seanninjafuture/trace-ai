"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

type CanvasSaveContextValue = {
  projectId: string;
  status: CanvasSaveStatus;
  setStatus: (status: CanvasSaveStatus) => void;
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

  const value = useMemo(
    () => ({ projectId, status, setStatus }),
    [projectId, status]
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
