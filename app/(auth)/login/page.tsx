"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/features/auth/auth-store";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <main className="container py-10">
      <h1 className="mb-4 text-2xl font-bold">Вход</h1>
      <AuthForm
        type="login"
        onSubmit={async ({ email, password }) => {
          await login({ email, password });
          router.push("/");
        }}
      />
      <p className="mt-3 text-sm">Нет аккаунта? <Link href="/register" className="text-blue-600">Регистрация</Link></p>
    </main>
  );
}
