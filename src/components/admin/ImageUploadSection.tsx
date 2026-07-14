"use client";

import { useState } from "react";
import Image from "next/image";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/utils";
import { adminUi } from "@/lib/admin-ui";

type ProductImage = {
  id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
};

export function ImageUploadSection({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [items, setItems] = useState(images);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError("סוג קובץ לא נתמך (jpeg, png, webp)");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("הקובץ גדול מ-5MB");
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(data.error ?? "העלאה נכשלה");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: data.id,
        storage_path: data.storage_path,
        public_url: data.public_url,
        alt_text: file.name,
      },
    ]);
  }

  return (
    <section className={adminUi.section}>
      <h2 className={adminUi.h2}>תמונות</h2>
      <input
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void handleUpload(file);
          }
        }}
        className="text-sm"
      />
      {uploading ? <p className={`text-sm ${adminUi.muted}`}>מעלה...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-4">
        {items.map((image) => (
          <div key={image.id} className="relative h-24 w-24 overflow-hidden rounded-md border">
            <Image
              src={image.public_url}
              alt={image.alt_text ?? "product"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </section>
  );
}
