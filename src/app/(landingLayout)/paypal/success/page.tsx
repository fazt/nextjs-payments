import Link from "next/link";

function SuccessPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900">¡Pago con PayPal completado!</h1>
      <p className="text-lg text-gray-600">Gracias por tu compra. El pedido ya está registrado.</p>
      <Link href="/products" className="mt-4 text-indigo-600 hover:underline">
        Seguir comprando →
      </Link>
    </div>
  );
}

export default SuccessPage;
