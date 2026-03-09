"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/features/auth/auth-store";
import { authApi } from "@/lib/api/requests";

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const save = async () => {
    await authApi.updateProfile({ full_name: fullName, phone });
    await refreshMe();
  };

  if (!user) return <main className="container py-8">Требуется авторизация.</main>;

  return (
    <>
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <div className="mt-4 max-w-xl space-y-3 rounded-lg border bg-white p-4">
          <input className="w-full rounded-md border px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full rounded-md border px-3 py-2" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white" onClick={save}>Сохранить</button>
        </div>
      </main>
    </>
  );
}
