import { authOptions } from "@/libs/authOptions";
import { getServerSession } from "next-auth";
import { Stripe } from "stripe";
import { ButtonUnsubscribe } from "./ButtonUnsubscribe";
import { ButtonSubscribe } from "./ButtonSubscribe";
import prisma from "@/libs/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function PageProfile() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  // console.log(session);
  let subscription = null;

  if (user?.subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(
      session?.user?.subscriptionId as string
    );
  }
  // console.log(subscription);

  return (
    <div className="text-center py-10 text-2xl text-white">
      <div>
        <h1 className="text-2xl text-white font-bold">{user?.name}</h1>
        <h2 className="text-2xl text-white font-bold">{user?.email}</h2>
        {user.subscriptionId ? (
          <>
            <h1>Current Plan: {subscription?.plan.amount / 100}$</h1>
            <div className="flex justify-center">
              <ButtonUnsubscribe />
            </div>
          </>
        ) : (
          <div>
            <h1>You have canceled your subscription</h1>
            <ButtonSubscribe />
          </div>
        )}
      </div>
    </div>
  );
}
export default PageProfile;
