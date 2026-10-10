import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

async function createStripeCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  baseUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?upgrade=success`,
    cancel_url: `${baseUrl}/dashboard?upgrade=cancelled`,
    client_reference_id: userId,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { priceId } = await req.json();
  const userId = session.user.id;
  if (!priceId) {
    return new NextResponse("Price ID is required", { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  });
  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }
  let stripeCustomerId = user.stripeCustomerId;
  const appUrl = process.env.NEXTAUTH_URL;
  if (!appUrl) {
    console.error("NEXTAUTH_URL is not configured.");
    return new NextResponse("Service unavailable", { status: 503 });
  }
  const baseUrl = new URL(appUrl).origin;
  try {
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      stripeCustomerId = stripeCustomer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: stripeCustomerId },
        select: { id: true },
      });
      const checkoutSession = await createStripeCheckoutSession(
        stripeCustomerId,
        priceId,
        userId,
        baseUrl
      );
      return NextResponse.json({ url: checkoutSession.url });
    }
    const checkoutSession = await createStripeCheckoutSession(
      stripeCustomerId,
      priceId,
      userId,
      baseUrl
    );
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    // Self-healing: If the customer ID is from a different environment (e.g., live vs. test)
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing" &&
      error.param === "customer"
    ) {
      console.log("Stripe customer ID not found, creating a new one.");
      try {
        const newStripeCustomer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });
        const newStripeCustomerId = newStripeCustomer.id;
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: newStripeCustomerId },
          select: { id: true },
        });
        const checkoutSession = await createStripeCheckoutSession(
          newStripeCustomerId,
          priceId,
          userId,
          baseUrl
        );
        return NextResponse.json({ url: checkoutSession.url });
      } catch (creationError) {
        console.error(
          "Error recreating Stripe customer and session:",
          creationError
        );
        return new NextResponse("Internal Server Error after retry", {
          status: 500,
        });
      }
    }
    console.error("Error creating Stripe checkout session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
