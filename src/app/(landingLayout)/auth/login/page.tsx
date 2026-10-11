import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login page",
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  // Solo rutas internas, para no convertir el login en una redirección abierta
  const safeCallback =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : undefined;

  return (
    <div className="h-screen flex justify-center items-center">
      <LoginForm callbackUrl={safeCallback} />
    </div>
  );
}

export default LoginPage;
