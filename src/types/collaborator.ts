export type ProjectMemberRole = "owner" | "collaborator";

export type EnrichedProjectMember = {
  collaboratorId: string | null;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
  role: ProjectMemberRole;
};

export type ProjectCollaboratorsResponse = {
  isProjectOwner: boolean;
  members: EnrichedProjectMember[];
};
