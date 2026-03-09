"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { adminApi } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/use-async-data";
import type { ProductVariant } from "@/types/api";

type FormState = {
  name: string;
  categoryId: string;
  description: string;
};

export default function AdminProductsPage() {
  const products = useAsyncData("admin-products", adminApi.getProducts);
  const categories = useAsyncData("admin-categories", adminApi.getCategories);
  const skus = useAsyncData("admin-skus", adminApi.getSkus);

  const [productForm, setProductForm] = useState<FormState>({ name: "", categoryId: "", description: "" });
  const [images, setImages] = useState<File[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [skuCode, setSkuCode] = useState("");
  const [skuAttributesJson, setSkuAttributesJson] = useState('{"color":"black","size":"128gb"}');
  const [stock, setStock] = useState("0");
  const [price, setPrice] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedProductSkus = useMemo(
    () => (skus.data ?? []).filter((item) => item.product_id === selectedProductId),
    [selectedProductId, skus.data],
  );

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(event.target.files ?? []));
  }

  async function handleCreateProduct() {
    if (!productForm.name.trim() || !productForm.categoryId || images.length === 0) {
      setError("Заполните название, категорию и добавьте хотя бы одно фото.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const product = await adminApi.createProduct({
        name: productForm.name.trim(),
        category_id: Number(productForm.categoryId),
        description: productForm.description.trim() || undefined,
      });

      await adminApi.uploadProductImages(product.id, images);
      await products.refetch();
      setSelectedProductId(product.id);
      setProductForm({ name: "", categoryId: "", description: "" });
      setImages([]);
      setSuccess("Товар создан. Выберите карточку справа и добавьте SKU.");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Не удалось создать товар.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSku() {
    if (!selectedProductId) {
      setError("Сначала выберите товар.");
      return;
    }

    if (!skuCode.trim()) {
      setError("Укажите SKU.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const attributes = JSON.parse(skuAttributesJson) as Record<string, unknown>;
      const createdSku = await adminApi.createSku({
        product_id: selectedProductId,
        sku: skuCode.trim(),
        attributes,
      });

      await applyStockAndPrice(createdSku);
      await skus.refetch();
      setSkuCode("");
      setSuccess("SKU, остаток и цена сохранены.");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Ошибка при создании SKU.");
    } finally {
      setSaving(false);
    }
  }

  async function applyStockAndPrice(sku: ProductVariant) {
    await adminApi.setInventory({ sku_id: sku.id, stock: Number(stock) });
    await adminApi.bulkSkuPrices([{ sku: sku.sku, price: Number(price) }]);
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Товары</h2>
        <p className="mt-1 text-sm text-slate-500">Создавайте карточки товаров, загружайте фото, затем добавляйте SKU, остатки и цены.</p>
      </header>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">1) Создание товара</h3>
          <div className="mt-3 grid gap-3">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={productForm.name}
              onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Название товара"
            />
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={productForm.categoryId}
              onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">Выберите категорию</option>
              {(categories.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <textarea
              className="min-h-[90px] rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Описание"
            />

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">2) Фото товара (обязательно)</label>
              <input className="block w-full text-sm" multiple type="file" onChange={handleFilesChange} />
              <p className="mt-1 text-xs text-slate-500">Выбрано файлов: {images.length}</p>
            </div>

            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={saving}
              onClick={handleCreateProduct}
            >
              {saving ? "Сохраняем..." : "Создать карточку товара"}
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Список товаров</h3>
          <p className="mt-1 text-xs text-slate-500">Нажмите на карточку, чтобы открыть блок добавления SKU.</p>
          <div className="mt-3 max-h-[380px] space-y-2 overflow-auto pr-1">
            {(products.data ?? []).map((item) => (
              <button
                key={item.id}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedProductId === item.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 hover:border-slate-400"
                }`}
                onClick={() => setSelectedProductId(item.id)}
              >
                <p className="font-medium">{item.name}</p>
                <p className={`text-xs ${selectedProductId === item.id ? "text-slate-200" : "text-slate-500"}`}>ID: {item.id}</p>
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">3) Добавление SKU, остатков и цены</h3>
        <p className="mt-1 text-xs text-slate-500">
          Выбранный товар: {selectedProductId ? `#${selectedProductId}` : "не выбран"}
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={skuCode}
            onChange={(e) => setSkuCode(e.target.value)}
            placeholder="SKU"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Остаток"
          />
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена"
          />
          <textarea
            className="min-h-[90px] rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            value={skuAttributesJson}
            onChange={(e) => setSkuAttributesJson(e.target.value)}
            placeholder='{"color":"black"}'
          />
        </div>

        <button
          className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          disabled={saving || !selectedProductId}
          onClick={handleCreateSku}
        >
          Добавить SKU
        </button>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">SKU текущего товара</p>
          <ul className="mt-2 space-y-2">
            {selectedProductSkus.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="font-medium">{item.sku}</span>
                {item.attributes && <span className="ml-2 text-xs text-slate-500">{JSON.stringify(item.attributes)}</span>}
              </li>
            ))}
            {!selectedProductSkus.length && <li className="text-sm text-slate-500">SKU пока нет.</li>}
          </ul>
        </div>
      </article>
    </section>
  );
}
