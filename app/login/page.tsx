import { AuthShell } from "@/components/auth-shell"
import { TenantLoginForm } from "@/components/tenant-login-form"

export default function LoginPage() {
  return (
    <AuthShell>
      <TenantLoginForm />
    </AuthShell>
  )
}
