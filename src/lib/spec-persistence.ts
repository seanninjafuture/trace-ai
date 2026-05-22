import { put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";

export function specBlobPathname(projectId: string, specId: string): string {
  return `projects/${projectId}/specs/${specId}.md`;
}

export async function uploadProjectSpecMarkdown(
  projectId: string,
  specId: string,
  markdown: string
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const blob = await put(specBlobPathname(projectId, specId), markdown, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    contentType: "text/markdown; charset=utf-8",
  });

  return blob.url;
}

export async function archiveProjectSpec(
  projectId: string,
  markdown: string
): Promise<{ specId: string; filePath: string }> {
  const spec = await prisma.projectSpec.create({
    data: {
      projectId,
      filePath: "__pending__",
    },
  });

  const filePath = await uploadProjectSpecMarkdown(
    projectId,
    spec.id,
    markdown
  );

  await prisma.projectSpec.update({
    where: { id: spec.id },
    data: { filePath },
  });

  return { specId: spec.id, filePath };
}
