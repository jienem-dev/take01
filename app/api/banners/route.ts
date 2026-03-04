import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const banners = await prisma.bannerEvent.findMany({
    where: {
      isActive: true,
      startAt: { lte: now },
      endAt: { gte: now },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 10,
    select: { id: true, title: true, imageUrl: true, linkUrl: true },
  });

  return NextResponse.json({ banners });
}
