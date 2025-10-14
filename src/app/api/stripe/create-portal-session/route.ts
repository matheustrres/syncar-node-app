import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  if (!user || !user.stripeCustomerId) {
    return new NextResponse("Stripe customer not found", { status: 404 });
  }
  const baseUrl = `${req.headers.get("x-forwarded-proto")}://${req.headers.get(
    "x-forwarded-host"
  )}`;
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/profile`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating Stripe portal session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
