import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { requireUser } from "@/libs/session";
import { jsonError } from "@/libs/config";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

// Sube la imagen de un producto a Cloudinary y devuelve su secure_url.
export async function POST(request: Request) {
  const { error } = await requireUser();
  if (error) return error;

  if (!isCloudinaryConfigured()) {
    return jsonError("Cloudinary no está configurado: no se pueden subir imágenes", 503);
  }

  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File)) return jsonError("Archivo no encontrado", 400);
  if (!file.type.startsWith("image/")) return jsonError("El archivo debe ser una imagen", 400);
  if (file.size > MAX_SIZE) return jsonError("La imagen no puede superar 5 MB", 400);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", folder: "nextjs-payments" }, (err, res) => {
          if (err || !res) return reject(err ?? new Error("Respuesta vacía de Cloudinary"));
          resolve(res);
        })
        .end(buffer);
    });

    return NextResponse.json({ secure_url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("[upload] Error subiendo a Cloudinary", err);
    return jsonError("No se pudo subir la imagen", 502);
  }
}
