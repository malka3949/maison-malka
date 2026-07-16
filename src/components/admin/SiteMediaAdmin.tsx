"use client";

import { useActionState, useRef, useState } from "react";
import {
  deleteSiteMediaAction,
  updateSiteMediaAltsAction,
  type SiteFormState,
} from "@/lib/actions/site-cms";
import { adminUi } from "@/lib/admin-ui";

type MediaItem = {
  id: string;
  storage_path: string;
  alt_he: string;
  alt_en: string;
  public_url: string;
};

const initial: SiteFormState = {};

export function SiteMediaAdmin({ items }: { items: MediaItem[] }) {
  const [list, setList] = useState(items);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setUploadError("בחרו קובץ");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("alt_he", "");
      fd.set("alt_en", "");
      const res = await fetch("/api/admin/upload-site-media", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "העלאה נכשלה");
        return;
      }
      setList((prev) => [
        {
          id: data.id,
          storage_path: data.storage_path,
          alt_he: "",
          alt_en: "",
          public_url: data.public_url,
        },
        ...prev,
      ]);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setUploadError("שגיאת רשת");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onUpload} className={adminUi.section}>
        <h2 className={adminUi.h2}>העלאת תמונת אתר</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={adminUi.input}
        />
        {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
        <button type="submit" className={adminUi.btnPrimary} disabled={uploading}>
          {uploading ? "מעלה…" : "העלאה"}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <MediaCard key={item.id} item={item} onDeleted={(id) => setList((p) => p.filter((x) => x.id !== id))} />
        ))}
      </div>
      {list.length === 0 ? (
        <p className={adminUi.muted}>אין תמונות אתר עדיין.</p>
      ) : null}
    </div>
  );
}

function MediaCard({
  item,
  onDeleted,
}: {
  item: MediaItem;
  onDeleted: (id: string) => void;
}) {
  const [altState, altAction, altPending] = useActionState(
    updateSiteMediaAltsAction,
    initial,
  );
  const [delState, delAction, delPending] = useActionState(
    async (prev: SiteFormState, fd: FormData) => {
      const result = await deleteSiteMediaAction(prev, fd);
      if (result.success) onDeleted(item.id);
      return result;
    },
    initial,
  );

  return (
    <div className={adminUi.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.public_url}
        alt={item.alt_he || item.alt_en || "site media"}
        className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
      />
      <p className="mb-2 truncate text-xs text-mm-secondary">{item.id}</p>
      <form action={altAction} className="space-y-2">
        <input type="hidden" name="id" value={item.id} />
        <input
          name="alt_he"
          defaultValue={item.alt_he}
          placeholder="Alt עברית"
          className={adminUi.input}
        />
        <input
          name="alt_en"
          defaultValue={item.alt_en}
          placeholder="Alt English"
          className={adminUi.input}
        />
        <button type="submit" className={adminUi.btnSecondary} disabled={altPending}>
          שמור alt
        </button>
        {altState.success ? (
          <p className="text-xs text-green-700">נשמר</p>
        ) : null}
        {altState.error ? (
          <p className="text-xs text-red-600">{altState.error}</p>
        ) : null}
      </form>
      <form action={delAction} className="mt-3">
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="cursor-pointer text-sm text-red-700 underline"
          disabled={delPending}
        >
          מחיקה
        </button>
        {delState.error ? (
          <p className="text-xs text-red-600">{delState.error}</p>
        ) : null}
      </form>
    </div>
  );
}
