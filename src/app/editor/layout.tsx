import type { ReactNode } from "react";

import { EditorLayout } from "@/components/editor/editor-layout";

export default function EditorRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden">
      <EditorLayout>{children}</EditorLayout>
    </div>
  );
}
