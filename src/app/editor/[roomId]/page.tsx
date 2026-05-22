import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CanvasProvider, CanvasSurface } from "@/components/canvas/canvas-provider";
import { TraceCanvas } from "@/components/canvas/trace-canvas";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorLayout } from "@/components/editor/editor-layout";
import { ensureLiveblocksRoom } from "@/lib/ensure-liveblocks-room";
import { evaluateProjectAccess } from "@/lib/project-access";
import { slugifyProjectName } from "@/lib/slugify";
import { listProjectSpecsForProject } from "@/server/projects/list-project-specs";
import type { WorkspaceProject } from "@/types/project";

type EditorRoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { roomId } = await params;
  const { authorized, project } = await evaluateProjectAccess(roomId);

  if (!authorized || !project) {
    return <AccessDenied />;
  }

  const workspaceProject: WorkspaceProject = {
    id: project.id,
    name: project.name,
    slug: project.canvasJsonPath.trim() || slugifyProjectName(project.name),
    owned: project.ownerId === userId,
  };

  const projectSpecs = await listProjectSpecsForProject(project.id);

  try {
    await ensureLiveblocksRoom(workspaceProject.slug);
  } catch (error) {
    console.error("[editor] ensure Liveblocks room failed", {
      roomId: workspaceProject.slug,
      error,
    });
  }

  return (
    <CanvasProvider
      roomId={workspaceProject.slug}
      projectId={workspaceProject.id}
    >
      <EditorLayout
        workspaceProject={workspaceProject}
        projectSpecs={projectSpecs}
        liveblocksRoom
        liveblocksRoomId={workspaceProject.slug}
      >
        <CanvasSurface>
          <TraceCanvas />
        </CanvasSurface>
      </EditorLayout>
    </CanvasProvider>
  );
}
