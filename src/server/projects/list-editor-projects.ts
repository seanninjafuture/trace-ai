import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

import {
  getVerifiedUserEmail,
  listProjectsForUser,
} from "@/lib/projects-api";
import { ensureClerkUserInDatabase } from "@/server/actions/sync-clerk-user";
import { slugifyProjectName } from "@/lib/slugify";
import type { WorkspaceProject } from "@/types/project";

function toWorkspaceProject(
  project: {
    id: string;
    ownerId: string;
    name: string;
    canvasJsonPath: string;
  },
  userId: string
): WorkspaceProject {
  return {
    id: project.id,
    name: project.name,
    slug:
      project.canvasJsonPath.trim() || slugifyProjectName(project.name),
    owned: project.ownerId === userId,
  };
}

export const listEditorProjectsForCurrentUser = cache(
  async (): Promise<{
    ownedProjects: WorkspaceProject[];
    sharedProjects: WorkspaceProject[];
  }> => {
    const { userId } = await auth();

    if (!userId) {
      return { ownedProjects: [], sharedProjects: [] };
    }

    await ensureClerkUserInDatabase(userId);

    const email = await getVerifiedUserEmail();
    const projects = await listProjectsForUser(userId, email);

    const ownedProjects: WorkspaceProject[] = [];
    const sharedProjects: WorkspaceProject[] = [];

    for (const project of projects) {
      const mapped = toWorkspaceProject(project, userId);
      if (project.ownerId === userId) {
        ownedProjects.push(mapped);
      } else {
        sharedProjects.push(mapped);
      }
    }

    return { ownedProjects, sharedProjects };
  }
);
