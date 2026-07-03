import { AuthShell } from "@/components/auth-shell"
import { OwnerLoginForm } from "@/components/owner-login-form"

export default function OwnerLoginPage() {
  return (
    <AuthShell>
      <OwnerLoginForm />
    </AuthShell>
  )
}
