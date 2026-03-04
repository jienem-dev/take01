import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine") === "true";

  const posts = await prisma.post.findMany({
    where: mine ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, title: true, content: true, createdAt: true },
  });

  return NextResponse.json({ posts });
}
