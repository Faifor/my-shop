import Link from "next/link";
import type { Product } from "@/types/api";

export function ProductCard({ product }: { product: Product }) {
  const price = product.variants?.[0]?.price;
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 h-44 rounded-lg bg-slate-100" />
      <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description || "Описание скоро будет добавлено"}</p>
      <div className="mt-2 text-sm">⭐ {product.rating ?? "—"}</div>
      <div className="mt-2 font-bold">{price ? `${price} ₽` : "Цена по запросу"}</div>
      <Link href={`/catalog/${product.id}`} className="mt-3 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm text-white">Открыть</Link>
    </article>
  );
}
