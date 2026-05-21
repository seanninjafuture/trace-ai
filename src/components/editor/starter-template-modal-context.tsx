"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StarterTemplateModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openModal: () => void;
};

const StarterTemplateModalContext =
  createContext<StarterTemplateModalContextValue | null>(null);

export function StarterTemplateModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);

  const value = useMemo(
    () => ({ open, setOpen, openModal }),
    [open, openModal]
  );

  return (
    <StarterTemplateModalContext.Provider value={value}>
      {children}
    </StarterTemplateModalContext.Provider>
  );
}

export function useStarterTemplateModal() {
  return useContext(StarterTemplateModalContext);
}
