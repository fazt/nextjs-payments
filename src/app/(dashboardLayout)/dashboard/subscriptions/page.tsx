"use client";

import { Button } from "@/components/ui";
import { signOut, useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();

  async function createProduct() {
    const response = await fetch("/api/payments/paypal/create-product", {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
  }

  async function createPlan() {
    const response = await fetch("/api/payments/paypal/create-plan", {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
  }

  async function createSubscription() {
    const response = await fetch("/api/payments/paypal/create-subscription", {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
    window.location.href = data.links[0].href;
  }

  async function cancelSubscription() {
    const response = await fetch(
      `/api/payments/paypal/cancel-subscription/${session?.user.subscriptionId}`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    console.log(data);

    if (response.status === 200) {
      console.log("Subscription canceled");
      await signOut();
      // router.push('/')
    }
  }

  console.log(session);

  return (
    <div>
      <Button onClick={createProduct}>Crear Product</Button>
      <Button onClick={createPlan}>Crear Plan</Button>
      <Button onClick={createSubscription}>Crear Subscripcion</Button>
      <Button onClick={cancelSubscription}>Cancel Subscription</Button>
    </div>
  );
}
