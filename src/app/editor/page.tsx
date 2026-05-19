import { EditorHome } from "@/components/editor/editor-home";
import { listEditorProjectsForCurrentUser } from "@/server/projects/list-editor-projects";

export default async function EditorPage() {
  await listEditorProjectsForCurrentUser();

  return <EditorHome />;
}
