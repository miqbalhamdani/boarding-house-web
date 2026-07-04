import { AuthShell } from "@/components/auth-shell"
import { OwnerRegisterForm } from "@/components/owner-register-form"

export default function OwnerRegisterPage() {
  return (
    <AuthShell>
      <OwnerRegisterForm />
    </AuthShell>
  )
}
