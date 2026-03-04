import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const type = event.type;

  // Subscription updates
  if (type === "customer.subscription.created" || type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    const sub = event.data.object as any;
    const customerId = sub.customer as string;
    const status = sub.status as string;
    const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

    // Map stripe status to our enum
    const mapped =
      status === "active" ? "active" :
      status === "past_due" ? "past_due" :
      "canceled";

    await prisma.membership.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        status: mapped,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: currentPeriodEnd ?? undefined,
      },
    });
  }

  // Checkout completed: ensure active (sometimes faster feedback)
  if (type === "checkout.session.completed") {
    const session = event.data.object as any;
    const customerId = session.customer as string | undefined;
    const subscriptionId = session.subscription as string | undefined;

    if (customerId) {
      await prisma.membership.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: "active", stripeSubscriptionId: subscriptionId ?? undefined },
      });
    }
  }

  return NextResponse.json({ received: true });
}
