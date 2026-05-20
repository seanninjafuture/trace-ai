"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Link2, Trash2, User, UserPlus } from "lucide-react";

import { DialogShell } from "@/components/editor/dialog-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  EnrichedProjectMember,
  ProjectCollaboratorsResponse,
} from "@/types/collaborator";

const shareDialogOverlayClassName =
  "fixed inset-0 isolate z-50 bg-black/80 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

type ShareDialogProps = {
  projectId: string;
  isProjectOwner: boolean;
};

function MemberAvatar({ member }: { member: EnrichedProjectMember }) {
  const label = member.displayName ?? member.email;

  if (member.imageUrl) {
    return (
      <img
        src={member.imageUrl}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border-default"
      />
    );
  }

  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-surface ring-1 ring-border-default"
      aria-hidden
    >
      <User className="size-4 text-text-muted" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ShareDialog({ projectId, isProjectOwner }: ShareDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<EnrichedProjectMember[]>([]);
  const [canManage, setCanManage] = useState(isProjectOwner);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "Could not load collaborators.");
        return;
      }

      const payload = (await response.json()) as ProjectCollaboratorsResponse;
      setMembers(payload.members);
      setCanManage(payload.isProjectOwner);
    } catch {
      setError("Could not load collaborators.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    void loadCollaborators();
  }, [open, loadCollaborators]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleInvite = () => {
    const email = inviteEmail.trim();
    if (!email || !canManage) return;

    void (async () => {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(payload?.error ?? "Could not send invite.");
          return;
        }

        setInviteEmail("");
        setSuccessMessage(`Invite email sent to ${email}.`);
        await loadCollaborators();
        router.refresh();
      } catch {
        setError("Could not send invite.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const handleRemove = (collaboratorId: string) => {
    if (!canManage) return;

    void (async () => {
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(payload?.error ?? "Could not remove collaborator.");
          return;
        }

        await loadCollaborators();
        router.refresh();
      } catch {
        setError("Could not remove collaborator.");
      }
    })();
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/editor/${projectId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Could not copy link to clipboard.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="size-4" />
        Share
      </Button>

      <DialogShell
        open={open}
        onOpenChange={setOpen}
        title="Share Architecture Workspace"
        description="Invite teammates by email or copy a direct link to this workspace."
        contentClassName="max-w-md"
        overlayClassName={shareDialogOverlayClassName}
        footer={
          canManage ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleInvite();
                }}
              >
                <Input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  disabled={isSubmitting}
                  className="min-w-0 flex-1"
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  disabled={!inviteEmail.trim() || isSubmitting}
                >
                  Send Invite
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => void handleCopyLink()}
              >
                <Link2 className="size-4" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          ) : undefined
        }
      >
        <ScrollArea className="max-h-56 pr-3">
          <ul className="flex flex-col gap-2">
            {isLoading ? (
              <li className="py-6 text-center text-sm text-text-muted">
                Loading teammates…
              </li>
            ) : null}

            {!isLoading && members.length === 0 ? (
              <li className="py-6 text-center text-sm text-text-muted">
                No teammates have been invited yet.
              </li>
            ) : null}

            {!isLoading
              ? members.map((member) => (
                  <li
                    key={
                      member.collaboratorId ??
                      `owner-${member.email.toLowerCase()}`
                    }
                    className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-base px-3 py-2.5"
                  >
                    <MemberAvatar member={member} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {member.displayName ?? member.email}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {member.email}
                      </p>
                      {member.role === "owner" ? (
                        <p className="mt-0.5 text-xs text-accent-primary">
                          Owner
                        </p>
                      ) : null}
                    </div>
                    {canManage &&
                    member.role === "collaborator" &&
                    member.collaboratorId ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-state-error hover:text-state-error"
                        aria-label={`Remove ${member.email}`}
                        onClick={() => handleRemove(member.collaboratorId!)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </li>
                ))
              : null}
          </ul>
        </ScrollArea>

      {error ? (
        <p className="mt-3 text-xs text-state-error" role="alert">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 text-xs text-state-success" role="status">
          {successMessage}
        </p>
      ) : null}
      </DialogShell>
    </>
  );
}

