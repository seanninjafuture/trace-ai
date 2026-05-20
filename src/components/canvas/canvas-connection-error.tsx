"use client";

import { useErrorListener } from "@liveblocks/react/suspense";
import { RefreshCw } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type CanvasConnectionErrorProps = {
  children: ReactNode;
};

function connectionErrorMessage(code: number): string {
  switch (code) {
    case -1:
      return "Authentication failed. Sign in again to join this workspace.";
    case 4001:
      return "You do not have access to this workspace room.";
    case 4005:
      return "This workspace room is full. Try again later.";
    case 4006:
      return "The workspace room changed. Reload to reconnect.";
    default:
      return "Could not connect to the collaborative canvas.";
  }
}

export function CanvasConnectionError({ children }: CanvasConnectionErrorProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      setErrorMessage(connectionErrorMessage(error.context.code));
    }
  });

  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    window.location.reload();
  }, []);

  if (errorMessage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-base p-6">
        <div
          role="alert"
          className="max-w-md rounded-xl border border-border-default bg-bg-surface p-6 text-center shadow-lg"
        >
          <p className="text-sm font-medium text-text-primary">
            Connection error
          </p>
          <p className="mt-2 text-sm text-text-muted">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 gap-2"
            onClick={handleRetry}
          >
            <RefreshCw className="size-4" aria-hidden />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
