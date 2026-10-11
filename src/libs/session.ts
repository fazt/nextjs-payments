import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { jsonError } from "@/libs/config";

export function getSession() {
  return getServerSession(authOptions);
}

type Guard =
  | { session: Session; error?: undefined }
  | { session?: undefined; error: Response };

/** Para route handlers: exige un usuario autenticado. */
export async function requireUser(): Promise<Guard> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: jsonError("Debes iniciar sesión", 401) };
  }
  return { session };
}

/** Para route handlers: exige un usuario con rol admin. */
export async function requireAdmin(): Promise<Guard> {
  const result = await requireUser();
  if (result.error) return result;
  if (result.session.user.role !== "admin") {
    return { error: jsonError("No tienes permisos para esta acción", 403) };
  }
  return result;
}
