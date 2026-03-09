"use client";

import { useState } from "react";

type AuthFormProps = {
  type: "login" | "register";
  onSubmit: (payload: { email: string; password: string; full_name?: string; phone?: string }) => Promise<void>;
};

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 8) {
      setError("Проверьте email и пароль (минимум 8 символов)");
      return;
    }
    setError("");
    await onSubmit({ email, password, full_name: fullName || undefined, phone: phone || undefined });
  };

  return (
    <form className="space-y-3 rounded-lg border bg-white p-5" onSubmit={submit}>
      {type === "register" && <input className="w-full rounded-md border px-3 py-2" placeholder="ФИО" value={fullName} onChange={(e) => setFullName(e.target.value)} required />}
      {type === "register" && <input className="w-full rounded-md border px-3 py-2" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />}
      <input className="w-full rounded-md border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded-md border px-3 py-2" type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">{type === "login" ? "Войти" : "Зарегистрироваться"}</button>
    </form>
  );
}
