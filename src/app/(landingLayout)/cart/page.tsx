import type { Metadata } from "next";
import { CartList } from "./cart-list";
import { getGatewayStatus } from "@/libs/config";
import { getPaypalClientId, getPaypalEnvironment } from "@/libs/paypal";
import { getMercadoPagoPublicKey } from "@/libs/mercadopago";

export const metadata: Metadata = {
  title: "Carrito | Next Payments",
};

// Las credenciales se leen en cada petición: así una pasarela sin claves se
// muestra como no disponible sin tener que recompilar.
export const dynamic = "force-dynamic";

export default function CartPage() {
  const gateways = getGatewayStatus();
  const paypalClientId = getPaypalClientId();

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-28 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">Carrito</h1>
      <CartList
        gateways={gateways}
        paypal={
          gateways.paypal && paypalClientId
            ? { clientId: paypalClientId, environment: getPaypalEnvironment() }
            : null
        }
        mercadoPagoPublicKey={getMercadoPagoPublicKey()}
      />
    </div>
  );
}
