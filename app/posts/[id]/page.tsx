import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Container } from "@/components/Container";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { title: true, content: true, createdAt: true },
  });

  return (
    <AppShell>
      <Container>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-lg font-bold">{post?.title ?? "게시글"}</div>
          <div className="mt-2 text-xs text-slate-500">
            {post ? new Date(post.createdAt).toLocaleString() : ""}
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
            {post?.content ?? "게시글을 찾을 수 없어요."}
          </div>
        </div>
      </Container>
    </AppShell>
  );
}
