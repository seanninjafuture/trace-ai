export type WorkspaceProject = {
  id: string;
  name: string;
  /** Liveblocks room id / canvasJsonPath slug */
  slug: string;
  owned: boolean;
};
