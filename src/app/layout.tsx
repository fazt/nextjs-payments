import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "@/context/Provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Payments",
  description: "Tienda y suscripciones con Next.js, Stripe, PayPal y Mercado Pago",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 h-screen`}>
        <Provider>{children}</Provider>
        <Toaster richColors />
      </body>
    </html>
  );
}
