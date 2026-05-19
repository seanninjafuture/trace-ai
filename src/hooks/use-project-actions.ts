"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  generateProjectRoomId,
  previewProjectRoomId,
} from "@/lib/generate-project-room-id";
import type { WorkspaceProject } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete" | null;

type UseProjectActionsOptions = {
  ownedProjects: WorkspaceProject[];
  sharedProjects: WorkspaceProject[];
};

export function useProjectActions({
  ownedProjects,
  sharedProjects,
}: UseProjectActionsOptions) {
  const router = useRouter();
  const params = useParams();

  const routeProjectId =
    typeof params.projectId === "string" ? params.projectId : null;

  const [activeDialog, setActiveDialog] = useState<ProjectDialogType>(null);
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [targetProject, setTargetProject] = useState<WorkspaceProject | null>(
    null
  );
  const [isProjectSidebarOpen, setProjectSidebarOpen] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const isLayoutLoading = loadingCount > 0;

  const allProjects = useMemo(
    () => [...ownedProjects, ...sharedProjects],
    [ownedProjects, sharedProjects]
  );

  const activeProject = useMemo(
    () => allProjects.find((project) => project.id === routeProjectId) ?? null,
    [allProjects, routeProjectId]
  );

  const createRoomIdPreview = useMemo(
    () => previewProjectRoomId(createName),
    [createName]
  );

  const runWithLoading = useCallback(
    async (action: () => void | Promise<void>) => {
      setLoadingCount((count) => count + 1);
      try {
        await action();
      } finally {
        setLoadingCount((count) => Math.max(0, count - 1));
      }
    },
    []
  );

  const openCreate = useCallback(() => {
    setCreateName("");
    setActionError(null);
    setActiveDialog("create");
  }, []);

  const openRename = useCallback((project: WorkspaceProject) => {
    if (!project.owned) return;
    setTargetProject(project);
    setRenameName(project.name);
    setActiveDialog("rename");
  }, []);

  const openDelete = useCallback((project: WorkspaceProject) => {
    if (!project.owned) return;
    setTargetProject(project);
    setActiveDialog("delete");
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setTargetProject(null);
  }, []);

  const selectProject = useCallback(
    (project: WorkspaceProject) => {
      setProjectSidebarOpen(false);
      router.push(`/editor/${project.id}`);
    },
    [router]
  );

  const handleCreateSubmit = useCallback(() => {
    const name = createName.trim();
    if (!name) return;

    void runWithLoading(async () => {
      setActionError(null);
      const canvasJsonPath = generateProjectRoomId(name);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, canvasJsonPath }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setActionError(
          payload?.error ?? "Could not create project. Try again."
        );
        return;
      }

      const project = (await response.json()) as { id: string };

      setCreateName("");
      setActiveDialog(null);
      setProjectSidebarOpen(false);
      router.push(`/editor/${project.id}`);
    });
  }, [createName, runWithLoading, router]);

  const handleRenameSubmit = useCallback(() => {
    if (!targetProject || !targetProject.owned) return;
    const name = renameName.trim();
    if (!name) return;

    void runWithLoading(async () => {
      const response = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        return;
      }

      setActiveDialog(null);
      setTargetProject(null);
      router.refresh();
    });
  }, [renameName, targetProject, runWithLoading, router]);

  const handleDeleteConfirm = useCallback(() => {
    if (!targetProject || !targetProject.owned) return;

    void runWithLoading(async () => {
      const response = await fetch(`/api/projects/${targetProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return;
      }

      const deletedId = targetProject.id;
      setActiveDialog(null);
      setTargetProject(null);

      if (routeProjectId === deletedId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    });
  }, [targetProject, runWithLoading, router, routeProjectId]);

  return {
    ownedProjects,
    sharedProjects,
    activeProject,
    activeDialog,
    createName,
    setCreateName,
    createRoomIdPreview,
    renameName,
    setRenameName,
    targetProject,
    isProjectSidebarOpen,
    setProjectSidebarOpen,
    isLayoutLoading,
    actionError,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    selectProject,
    handleCreateSubmit,
    handleRenameSubmit,
    handleDeleteConfirm,
  };
}

export type ProjectActionsState = ReturnType<typeof useProjectActions>;
