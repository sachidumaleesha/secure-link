"use server";
import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/config/db";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  server: "sandbox",
});

export const createCheckout = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("User not found");
  }

  const res = await db.user.findUnique({
    where: {
      id: clerkUser?.id,
    },
  });

  if (res?.plan === "LIFETIME") {
    throw new Error("You already has a pro plan");
  }

  const checkout = await polar.checkouts.create({
    products: ["41e7bcce-994d-49e6-b2ce-c470a5135b3b"],
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-success?userId=${clerkUser.id}`,
  });

  redirect(checkout.url);
};
