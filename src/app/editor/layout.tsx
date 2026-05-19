import type { ReactNode } from "react";

import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorWorkspaceProvider } from "@/components/editor/editor-workspace-provider";

export default function EditorRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <EditorWorkspaceProvider>
      <div className="h-full overflow-hidden">
        <EditorLayout>{children}</EditorLayout>
      </div>
    </EditorWorkspaceProvider>
  );
}
