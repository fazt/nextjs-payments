"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

interface Props {
  clearCart?: boolean;
}

/** Tras un pago correcto vacía el carrito y refresca la sesión (p. ej. la suscripción). */
function UpdateSession({ clearCart = false }: Props) {
  const { update } = useSession();
  const clear = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (clearCart) clear();
    // `update()` sin datos hace que el servidor relea el usuario de la base de datos
    void update();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  return null;
}

export default UpdateSession;
