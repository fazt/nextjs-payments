import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/libs/prisma";
import { registerSchema } from "@/schemas/authSchema";
import { jsonError } from "@/libs/config";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos", 400);
  }

  const { name, lastname, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return jsonError("Ya existe una cuenta con ese correo", 409);

  const user = await prisma.user.create({
    data: {
      name,
      last_name: lastname,
      email,
      password: await bcrypt.hash(password, 10),
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
