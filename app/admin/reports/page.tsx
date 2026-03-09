"use client";

import { adminApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";

export default function AdminReportsPage() {
  const reports = useAsyncData("admin-reports", adminApi.getReports);

  return (
    <section>
      <h2 className="font-semibold">Отчеты</h2>
      <pre className="mt-3 overflow-auto rounded border bg-white p-3 text-xs">{JSON.stringify(reports.data ?? {}, null, 2)}</pre>
    </section>
  );
}
