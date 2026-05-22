import { evaluateProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { ProjectSpecSummary } from "@/types/project-spec";

export type SpecAccessResult =
  | { ok: true }
  | { status: 401 | 403 | 404; error: string };

export async function requireProjectSpecAccess(
  projectId: string
): Promise<SpecAccessResult> {
  const access = await evaluateProjectAccess(projectId);

  if (!access.project) {
    return { status: 404, error: "Not found" };
  }

  if (!access.authorized) {
    return { status: 403, error: "Forbidden" };
  }

  return { ok: true };
}

export async function findProjectSpecInProject(
  projectId: string,
  specId: string
): Promise<{ filePath: string } | null> {
  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { projectId: true, filePath: true },
  });

  if (!spec || spec.projectId !== projectId || spec.filePath === "__pending__") {
    return null;
  }

  return { filePath: spec.filePath };
}

export async function fetchSpecMarkdownFromBlob(
  filePath: string
): Promise<string | null> {
  try {
    const blobResponse = await fetch(filePath, { cache: "no-store" });
    if (!blobResponse.ok) {
      return null;
    }
    return await blobResponse.text();
  } catch (error) {
    console.error("Spec blob fetch error", error);
    return null;
  }
}

export async function listProjectSpecSummaries(
  projectId: string
): Promise<ProjectSpecSummary[]> {
  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, projectId: true, createdAt: true },
  });

  return specs.map((spec) => ({
    id: spec.id,
    projectId: spec.projectId,
    createdAt: spec.createdAt.toISOString(),
  }));
}
