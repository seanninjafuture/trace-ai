import { Resend } from "resend";

export type CollaboratorInviteEmailParams = {
  toEmail: string;
  projectName: string;
  inviterName: string;
  workspaceUrl: string;
};

function buildInviteText({
  toEmail,
  projectName,
  inviterName,
  workspaceUrl,
}: CollaboratorInviteEmailParams): string {
  return [
    `${inviterName} invited you to collaborate on "${projectName}" in Trace AI.`,
    "",
    "Open the architecture workspace:",
    workspaceUrl,
    "",
    "Sign in with this email address to access the project:",
    toEmail,
    "",
    "If you do not have an account yet, create one using the same email, then open the link above.",
  ].join("\n");
}

function buildInviteHtml({
  toEmail,
  projectName,
  inviterName,
  workspaceUrl,
}: CollaboratorInviteEmailParams): string {
  const escapedProject = escapeHtml(projectName);
  const escapedInviter = escapeHtml(inviterName);
  const escapedUrl = escapeHtml(workspaceUrl);
  const escapedEmail = escapeHtml(toEmail);

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#09090b;font-family:Inter,Segoe UI,sans-serif;color:#f4f4f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#09090b;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#a1a1aa;">Trace AI</p>
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#f4f4f5;">You have been invited</h1>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#a1a1aa;">
                  <strong style="color:#f4f4f5;">${escapedInviter}</strong> invited you to collaborate on
                  <strong style="color:#f4f4f5;">${escapedProject}</strong>.
                </p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a1a1aa;">
                  Sign in with <strong style="color:#f4f4f5;">${escapedEmail}</strong> to open the workspace. If you do not have an account yet, sign up with this email first.
                </p>
                <a href="${escapedUrl}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">
                  Open workspace
                </a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#71717a;word-break:break-all;">
                  Or copy this link:<br />
                  <a href="${escapedUrl}" style="color:#3b82f6;">${escapedUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendCollaboratorInviteEmail(
  params: CollaboratorInviteEmailParams
): Promise<{ ok: true } | { ok: false; message: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      message:
        "Email delivery is not configured. Add RESEND_API_KEY to your environment.",
    };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ?? "Trace AI <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: params.toEmail,
    subject: `${params.inviterName} invited you to ${params.projectName} on Trace AI`,
    html: buildInviteHtml(params),
    text: buildInviteText(params),
  });

  if (error) {
    console.error("Collaborator invite email failed", error);
    return {
      ok: false,
      message: error.message ?? "Could not send invite email.",
    };
  }

  return { ok: true };
}
