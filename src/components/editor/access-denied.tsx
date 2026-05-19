import { Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-bg-base px-6"
      )}
    >
      <Lock className="size-12 text-text-muted" aria-hidden />
      <p className="mt-6 max-w-md text-center text-sm leading-relaxed text-text-muted">
        You do not have permission to access this architecture workspace or the
        project does not exist.
      </p>
      <Button type="button" className="mt-8" render={<Link href="/editor" />}>
        Back to editor
      </Button>
    </main>
  );
}
