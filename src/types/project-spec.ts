export type ProjectSpecSummary = {
  id: string;
  projectId: string;
  createdAt: string;
};

export function formatSpecDisplayTitle(specId: string): string {
  return `trace_ai_playbook_${specId}.md`;
}

export function formatSpecCreatedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function projectSpecDownloadPath(
  projectId: string,
  specId: string
): string {
  return `/api/projects/${projectId}/specs/${specId}/download`;
}
