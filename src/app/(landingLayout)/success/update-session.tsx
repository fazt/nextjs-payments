"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

function UpdateSession({ subscriptionId }) {
  const { update } = useSession();

  useEffect(() => {
    async function updateSession() {

      console.log(update)

      const result = await update({
        subscriptionId,
      });
      console.log(result);
    }
    updateSession();
  }, []);

  return <div>UpdateSession</div>;
}

export default UpdateSession;
