import type { ReactNode } from "react";

import { EditorLayout } from "@/components/editor/editor-layout";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <EditorLayout>{children}</EditorLayout>;
}
