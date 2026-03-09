"use client";

import { useState } from "react";
import { catalogApi } from "@/lib/api/requests";

export default function AdminInventoryPage() {
  const [variantId, setVariantId] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const [message, setMessage] = useState("");

  return (
    <section className="max-w-lg space-y-3">
      <h2 className="font-semibold">Управление складом</h2>
      <input className="w-full rounded border px-2 py-1" placeholder="variant_id" value={variantId} onChange={(e) => setVariantId(e.target.value)} />
      <input className="w-full rounded border px-2 py-1" type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} />
      <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={async () => {
        await catalogApi.updateInventory({ variant_id: variantId, stock_qty: stockQty });
        setMessage("Остатки обновлены");
      }}>Обновить</button>
      {message && <p>{message}</p>}
    </section>
  );
}
