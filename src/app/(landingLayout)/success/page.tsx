import { redirect } from "next/navigation";
import UpdateSession from "./update-session";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import prisma from "@/libs/prisma";

async function SuccessPage() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/login");
  // }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // obtener id de base de datos
  const sessionId =
    "cs_test_a1N6R5usuuHqsYh6KaXKG93d9aS2PI042yZmZmpzuHs2qmPW1Gecue2RSx";

  const result = await stripe.checkout.sessions.retrieve(sessionId);

  if (result.status === "complete") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">¡Pago exitoso!</h1>
      <p className="text-lg">Gracias por tu compra</p>

      <UpdateSession subscriptionId={user?.subscriptionId} />
    </div>
  );
}
export default SuccessPage;
