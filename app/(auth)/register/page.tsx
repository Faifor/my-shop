"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/features/auth/auth-store";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  return (
    <main className="container py-10">
      <h1 className="mb-4 text-2xl font-bold">Регистрация</h1>
      <AuthForm
        type="register"
        onSubmit={async ({ email, password, full_name, phone }) => {
          await register({ email, password, full_name: full_name ?? "", phone });
          router.push("/");
        }}
      />
      <p className="mt-3 text-sm">Уже зарегистрированы? <Link href="/login" className="text-blue-600">Войти</Link></p>
    </main>
  );
}
