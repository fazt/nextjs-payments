"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useCartStore, type CartProduct } from "@/store/cartStore";

interface Props {
  product: CartProduct & {
    authorName: string;
    categories: string[];
  };
}

const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" });

/** Quita las etiquetas del HTML que genera el editor Quill para mostrar un resumen. */
function plainText(html?: string | null) {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);
  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="bg-gray-200 group-hover:opacity-75 sm:h-96">
        {product.image ? (
          <Image
            src={product.image}
            className="h-full w-full object-cover object-center"
            alt={product.name}
            width={600}
            height={600}
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-400 sm:h-full">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          <span className="text-xs text-gray-500">por {product.authorName}</span>
        </div>
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        )}
        <p className="line-clamp-3 text-sm text-gray-500">{plainText(product.description)}</p>
        <div className="flex flex-1 flex-col justify-end gap-2">
          <p className="text-sm italic text-gray-500">
            {outOfStock ? "Agotado" : `${product.stock} en stock`}
          </p>
          <p className="text-base font-medium text-gray-900">{money.format(product.price)}</p>
          <Button
            disabled={outOfStock}
            onClick={() => {
              addToCart(product);
              toast.success(`${product.name} añadido al carrito`);
            }}
          >
            Añadir al carrito
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
