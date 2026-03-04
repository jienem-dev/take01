import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Container } from "@/components/Container";
import { SignOutButton } from "@/components/SignOutButton";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <Container>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">내 정보</div>
          <div className="mt-3 text-sm text-slate-700">
            {(session.user as any)?.email}
          </div>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
