export default function AdminHomePage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Добро пожаловать в админку</h2>
      <p className="mt-2 text-sm text-slate-600">
        Используйте вкладки сверху: в «Категориях» можно создавать и удалять категории, а в «Товарах» — создавать карточки,
        загружать фото и добавлять SKU с остатками и ценами.
      </p>
    </div>
  );
}
