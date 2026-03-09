"use client";

import { useState } from "react";
import { adminApi } from "@/lib/api/requests";

export default function AdminInventoryPage() {
  const [skuId, setSkuId] = useState(0);
  const [stock, setStock] = useState(0);
  const [message, setMessage] = useState("");

  return (
    <section className="max-w-lg space-y-3">
      <h2 className="font-semibold">Управление складом</h2>
      <input className="w-full rounded border px-2 py-1" placeholder="sku_id" value={skuId} onChange={(e) => setSkuId(Number(e.target.value))} />
      <input className="w-full rounded border px-2 py-1" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
      <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={async () => {
        await adminApi.setInventory({ sku_id: skuId, stock });
        setMessage("Остатки обновлены");
      }}>Обновить</button>
      {message && <p>{message}</p>}
    </section>
  );
}
