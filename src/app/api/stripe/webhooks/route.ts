import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse(`Webhook Error: ${(error as Error).message}`, {
      status: 400,
    });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  if (event.type === "checkout.session.completed") {
    if (!session?.client_reference_id) {
      return new NextResponse("Webhook Error: Missing client_reference_id", {
        status: 400,
      });
    }
    try {
      await prisma.user.update({
        where: {
          id: session.client_reference_id,
        },
        data: {
          plan: "PROFESSIONAL",
          stripeCustomerId: session.customer as string,
        },
      });
      revalidatePath("/api/profile");
    } catch {
      return new NextResponse("Webhook database error", { status: 500 });
    }
  }
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerId: subscription.customer as string,
      },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "PROFESSIONAL" },
      });
      revalidatePath("/api/profile");
    }
  }
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    console.log({ subscription });
    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerId: subscription.customer as string,
      },
    });
    if (user) {
      const newPlan =
        event.type === "customer.subscription.deleted"
          ? "BASIC"
          : "PROFESSIONAL";
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: newPlan,
        },
      });
      revalidatePath("/api/profile");
    }
  }
  if (event.type === "customer.deleted") {
    const customer = event.data.object as Stripe.Customer;
    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerId: customer.id,
      },
    });
    if (user) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: null,
          plan: "BASIC",
        },
      });
      revalidatePath("/api/profile");
    }
  }
  return new NextResponse(null, { status: 200 });
}
