"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/auth-store";

const links = [
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/inventory", label: "Склад" },
  { href: "/admin/reports", label: "Отчеты" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.role !== "admin") {
    return <main className="container py-10">Доступ только для администратора.</main>;
  }

  return (
    <div className="container py-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Админ-панель</h1>
        <p className="mt-1 text-sm text-slate-500">Управляйте каталогом, товарами и ценами в одном интерфейсе.</p>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 font-medium transition ${
                  active ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
