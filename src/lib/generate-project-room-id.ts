import { slugifyProjectName } from "@/lib/slugify";

/** Short unique suffix for Liveblocks room / canvasJsonPath alignment. */
function uniqueSuffix(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 4);
}

/** Slugified name plus cryptographic suffix (e.g. my-system-4f2a). */
export function generateProjectRoomId(name: string): string {
  const slug = slugifyProjectName(name);
  return `${slug}-${uniqueSuffix()}`;
}

/** Preview room id while typing (suffix shown as placeholder until create). */
export function previewProjectRoomId(name: string): string {
  const slug = slugifyProjectName(name);
  return `${slug}-xxxx`;
}
