import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { clerkSignInProps } from "@/lib/clerk-auth-routes";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn {...clerkSignInProps} />
    </AuthShell>
  );
}
