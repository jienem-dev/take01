import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  const lodgings = await prisma.lodging.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const withDist = lodgings.map((l) => ({
    ...l,
    distanceMeters: Number.isFinite(lat) && Number.isFinite(lng) ? haversineMeters(lat, lng, l.lat, l.lng) : undefined,
  }));

  withDist.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

  return NextResponse.json({ lodgings: withDist.slice(0, 10) });
}
