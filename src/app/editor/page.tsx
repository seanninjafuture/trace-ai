import { EditorHome } from "@/components/editor/editor-home";
import { EditorLayout } from "@/components/editor/editor-layout";
import { listEditorProjectsForCurrentUser } from "@/server/projects/list-editor-projects";

export default async function EditorPage() {
  await listEditorProjectsForCurrentUser();

  return (
    <EditorLayout>
      <EditorHome />
    </EditorLayout>
  );
}
