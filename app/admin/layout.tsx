"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    return <main className="container py-10">Доступ только для администратора.</main>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold">Админ-панель</h1>
      <nav className="mt-3 flex gap-3 text-sm">
        <Link href="/admin/categories">Категории</Link>
        <Link href="/admin/products">Товары</Link>
        <Link href="/admin/inventory">Склад</Link>
        <Link href="/admin/reports">Отчеты</Link>
      </nav>
      <div className="mt-5">{children}</div>
    </div>
  );
}
