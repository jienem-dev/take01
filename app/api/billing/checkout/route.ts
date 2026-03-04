import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "STRIPE_PRICE_ID missing" }, { status: 500 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Ensure membership row
  const membership = await prisma.membership.upsert({
    where: { userId },
    update: {},
    create: { userId, status: "canceled", barcodeValue: `MEMBER-${userId.slice(-8).toUpperCase()}` },
  });

  const customerId = membership.stripeCustomerId
    ? membership.stripeCustomerId
    : (await stripe.customers.create({ email: user.email, metadata: { userId } })).id;

  if (!membership.stripeCustomerId) {
    await prisma.membership.update({ where: { userId }, data: { stripeCustomerId: customerId } });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/?checkout=success",
    cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/?checkout=cancel",
    metadata: { userId },
  });

  return NextResponse.json({ url: checkout.url });
}
