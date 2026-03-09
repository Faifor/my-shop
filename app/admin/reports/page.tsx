"use client";

import { adminApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function AdminReportsPage() {
  const businessRules = useAsyncData("admin-business-rules", adminApi.getBusinessRulesReport);
  const revenue = useAsyncData("admin-revenue", () => adminApi.getRevenueReport({ group_by: "day" }));
  const topProducts = useAsyncData("admin-top-products", () => adminApi.getTopProductsReport({ limit: 5 }));

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">Отчеты</h2>
      <article>
        <h3 className="font-medium">Business Rules</h3>
        <pre className="mt-2 overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify(businessRules.data ?? {}, null, 2)}</pre>
      </article>
      <article>
        <h3 className="font-medium">Revenue</h3>
        <pre className="mt-2 overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify(revenue.data ?? {}, null, 2)}</pre>
      </article>
      <article>
        <h3 className="font-medium">Top Products</h3>
        <pre className="mt-2 overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify(topProducts.data ?? {}, null, 2)}</pre>
      </article>
    </section>
  );
}
