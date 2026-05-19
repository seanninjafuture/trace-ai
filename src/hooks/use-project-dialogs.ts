"use client";

import { useCallback, useMemo, useState } from "react";

import {
  INITIAL_OWNED_PROJECTS,
  INITIAL_SHARED_PROJECTS,
} from "@/lib/mock-projects";
import { slugifyProjectName } from "@/lib/slugify";
import type { MockProject } from "@/types/project";

export type ProjectDialogType = "create" | "rename" | "delete" | null;

const LOAD_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useProjectDialogs() {
  const [ownedProjects, setOwnedProjects] = useState(INITIAL_OWNED_PROJECTS);
  const [sharedProjects] = useState(INITIAL_SHARED_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<ProjectDialogType>(null);
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [targetProject, setTargetProject] = useState<MockProject | null>(null);
  const [isProjectSidebarOpen, setProjectSidebarOpen] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const isLayoutLoading = loadingCount > 0;

  const allProjects = useMemo(
    () => [...ownedProjects, ...sharedProjects],
    [ownedProjects, sharedProjects]
  );

  const activeProject = useMemo(
    () => allProjects.find((project) => project.id === activeProjectId) ?? null,
    [allProjects, activeProjectId]
  );

  const createSlug = useMemo(() => slugifyProjectName(createName), [createName]);

  const openCreate = useCallback(() => {
    setCreateName("");
    setActiveDialog("create");
  }, []);

  const openRename = useCallback((project: MockProject) => {
    if (!project.owned) return;
    setTargetProject(project);
    setRenameName(project.name);
    setActiveDialog("rename");
  }, []);

  const openDelete = useCallback((project: MockProject) => {
    if (!project.owned) return;
    setTargetProject(project);
    setActiveDialog("delete");
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setTargetProject(null);
  }, []);

  const runWithLoading = useCallback(
    async (action: () => void | Promise<void>) => {
      setLoadingCount((count) => count + 1);
      try {
        await delay(LOAD_DELAY_MS);
        await action();
      } finally {
        setLoadingCount((count) => Math.max(0, count - 1));
      }
    },
    []
  );

  const selectProject = useCallback(
    (project: MockProject) => {
      void runWithLoading(() => {
        setActiveProjectId(project.id);
        setProjectSidebarOpen(false);
      });
    },
    [runWithLoading]
  );

  const handleCreateSubmit = useCallback(() => {
    const name = createName.trim();
    if (!name) return;

    void runWithLoading(() => {
      const slug = slugifyProjectName(name);
      const newProject: MockProject = {
        id: `owned-${Date.now()}`,
        name,
        slug,
        owned: true,
      };
      setOwnedProjects((previous) => [newProject, ...previous]);
      setActiveProjectId(newProject.id);
      setCreateName("");
      setActiveDialog(null);
      setProjectSidebarOpen(false);
    });
  }, [createName, runWithLoading]);

  const handleRenameSubmit = useCallback(() => {
    if (!targetProject || !targetProject.owned) return;
    const name = renameName.trim();
    if (!name) return;

    void runWithLoading(() => {
      setOwnedProjects((previous) =>
        previous.map((project) =>
          project.id === targetProject.id
            ? { ...project, name, slug: slugifyProjectName(name) }
            : project
        )
      );
      setActiveDialog(null);
      setTargetProject(null);
    });
  }, [renameName, targetProject, runWithLoading]);

  const handleDeleteConfirm = useCallback(() => {
    if (!targetProject || !targetProject.owned) return;

    void runWithLoading(() => {
      setOwnedProjects((previous) =>
        previous.filter((project) => project.id !== targetProject.id)
      );
      setActiveProjectId((current) =>
        current === targetProject.id ? null : current
      );
      setActiveDialog(null);
      setTargetProject(null);
    });
  }, [targetProject, runWithLoading]);

  return {
    ownedProjects,
    sharedProjects,
    activeProject,
    activeDialog,
    createName,
    setCreateName,
    createSlug,
    renameName,
    setRenameName,
    targetProject,
    isProjectSidebarOpen,
    setProjectSidebarOpen,
    isLayoutLoading,
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

export type ProjectDialogsState = ReturnType<typeof useProjectDialogs>;
