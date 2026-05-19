import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";
import { clerkSignUpProps } from "@/lib/clerk-auth-routes";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp {...clerkSignUpProps} />
    </AuthShell>
  );
}
