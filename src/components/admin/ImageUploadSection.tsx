"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/utils";
import { adminUi } from "@/lib/admin-ui";
import {
  BG_PRESETS,
  composeCutoutOnBackground,
  prepareUploadImage,
  previewCss,
  type BgSpec,
} from "@/lib/admin-product-bg";

type ProductImage = {
  id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
};

async function cutOutProduct(file: Blob): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    debug: false,
    model: "isnet_fp16",
  });
}

function swatchStyle(spec: BgSpec) {
  return {
    ...previewCss(spec),
    width: "1rem",
    height: "1rem",
    borderRadius: "0.125rem",
    border: "1px solid #d6d3d1",
    display: "inline-block",
  } as const;
}

export function ImageUploadSection({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [items, setItems] = useState(images);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const [originalName, setOriginalName] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [cutoutPreview, setCutoutPreview] = useState<string | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const [activePreset, setActivePreset] = useState("white");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [bgSpec, setBgSpec] = useState<BgSpec>({ kind: "solid", color: "#ffffff" });

  const canSave = Boolean(cutoutBlob) && !busy && !saving;

  const previewPanelStyle = useMemo(() => previewCss(bgSpec), [bgSpec]);

  const solidPresets = useMemo(
    () => BG_PRESETS.filter((p) => p.group === "solid"),
    [],
  );
  const gradientPresets = useMemo(
    () => BG_PRESETS.filter((p) => p.group === "gradient"),
    [],
  );
  const patternPresets = useMemo(
    () => BG_PRESETS.filter((p) => p.group === "pattern"),
    [],
  );

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  function trackObjectUrl(url: string) {
    objectUrlsRef.current.push(url);
    return url;
  }

  function revokeTrackedUrls() {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];
  }

  function applyPreset(presetId: string, spec: BgSpec) {
    setActivePreset(presetId);
    setBgSpec(spec);
    if (spec.kind === "solid") {
      setCustomColor(spec.color);
    }
  }

  function handlePickBgImage(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError("סוג רקע לא נתמך (jpeg, png, webp)");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`תמונת הרקע גדולה מ-${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }
    setError(null);
    const url = trackObjectUrl(URL.createObjectURL(file));
    setActivePreset("custom-image");
    setBgSpec({ kind: "image", objectUrl: url, cover: true });
    setStatus("רקע מתמונה — רואים מיד בתצוגה החיה");
  }

  function resetEditor() {
    revokeTrackedUrls();
    setOriginalName(null);
    setOriginalPreview(null);
    setCutoutBlob(null);
    setCutoutPreview(null);
    setActivePreset("white");
    setBgSpec({ kind: "solid", color: "#ffffff" });
    setCustomColor("#ffffff");
    setStatus(null);
    setError(null);
  }

  async function handlePickFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError("סוג קובץ לא נתמך (jpeg, png, webp)");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`הקובץ גדול מ-${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    resetEditor();
    setBusy(true);
    setError(null);
    setOriginalName(file.name);
    setOriginalPreview(trackObjectUrl(URL.createObjectURL(file)));
    setStatus("מסיר רקע (פעם ראשונה עלול לקחת כ־30–60 שניות)...");

    try {
      const cutout = await cutOutProduct(file);
      setCutoutBlob(cutout);
      setCutoutPreview(trackObjectUrl(URL.createObjectURL(cutout)));
      setStatus("מוכן — בחרו רקע בזמן אמת ואז שמרו");
    } catch (err) {
      setError(err instanceof Error ? err.message : "הסרת הרקע נכשלה");
      setStatus(null);
      setCutoutBlob(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!cutoutBlob) return;

    setSaving(true);
    setError(null);
    setStatus("שומר תמונה...");

    try {
      const composed = await composeCutoutOnBackground(cutoutBlob, bgSpec);
      setStatus("דוחס תמונה לפני שמירה...");
      const prepared = await prepareUploadImage(composed, {
        keepAlpha: bgSpec.kind === "transparent",
        maxBytes: MAX_IMAGE_SIZE_BYTES,
      });
      const uploadFile = new File([prepared.blob], prepared.filename, {
        type: prepared.mime,
      });

      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("file", uploadFile);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      let data: {
        error?: string;
        id?: string;
        storage_path?: string;
        public_url?: string;
      } = {};
      try {
        data = await response.json();
      } catch {
        throw new Error(
          `העלאה נכשלה (HTTP ${response.status}). בדקו את מסוף השרת.`,
        );
      }
      if (!response.ok) {
        throw new Error(data.error ?? `העלאה נכשלה (HTTP ${response.status})`);
      }

      setItems((prev) => [
        ...prev,
        {
          id: data.id!,
          storage_path: data.storage_path!,
          public_url: data.public_url!,
          alt_text: uploadFile.name,
        },
      ]);
      resetEditor();
      setStatus("התמונה נשמרה בהצלחה");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירה נכשלה");
      setStatus(null);
    } finally {
      setSaving(false);
    }
  }

  function renderPresetGroup(
    title: string,
    presets: typeof BG_PRESETS,
  ) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-mm-secondary">{title}</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={busy || saving || !cutoutBlob}
              onClick={() => applyPreset(preset.id, preset.spec)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                activePreset === preset.id
                  ? "border-mm-primary bg-mm-soft text-mm-primary"
                  : "border-stone-200 bg-white text-mm-secondary hover:border-mm-cta"
              }`}
            >
              <span style={swatchStyle(preset.spec)} aria-hidden />
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={adminUi.section}>
      <div>
        <h2 className={adminUi.h2}>תמונות מוצר</h2>
        <p className={`mt-1 text-sm ${adminUi.muted}`}>
          1) בחרו תמונה → 2) בחרו רקע (צבע / גרדיאנט / דוגמה / תמונה שלכם) ורואים מיד → 3)
          שמירה. עד {MAX_IMAGE_SIZE_MB}MB. הכול חינמי בדפדפן.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-mm-line bg-mm-soft/40 px-4 py-8 text-center transition-colors hover:border-mm-cta hover:bg-mm-soft/70">
        <span className="text-sm font-medium text-mm-primary">
          {busy ? "מעבד תמונה..." : "לחצו לבחירת תמונה לעיבוד"}
        </span>
        <span className={`text-xs ${adminUi.muted}`}>
          לא שומרים עדיין — קודם עורכים רקע בזמן אמת
        </span>
        <input
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          disabled={busy || saving}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handlePickFile(file);
            e.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </label>

      {status ? <p className={`text-sm ${adminUi.muted}`}>{status}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {cutoutBlob || originalPreview ? (
        <div className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          {originalName ? (
            <p className="text-xs text-mm-secondary">קובץ: {originalName}</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-mm-word">מקור</p>
              <div className="flex min-h-40 items-center justify-center rounded-md border border-stone-200 bg-mm-soft/40 p-2">
                {originalPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={originalPreview}
                    alt="original"
                    className="max-h-44 w-auto object-contain"
                  />
                ) : null}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-mm-word">תצוגה חיה עם רקע</p>
              <div
                className="flex min-h-40 items-center justify-center rounded-md border border-stone-200 p-2"
                style={previewPanelStyle}
              >
                {cutoutPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cutoutPreview}
                    alt="live preview"
                    className="max-h-44 w-auto object-contain"
                  />
                ) : (
                  <p className={`text-sm ${adminUi.muted}`}>
                    {busy ? "מעבד..." : "ממתין לתמונה"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-mm-primary">בחירת רקע (מתעדכן מיד)</p>
            {renderPresetGroup("צבע אחיד / שקוף", solidPresets)}
            {renderPresetGroup("גרדיאנטים", gradientPresets)}
            {renderPresetGroup("דוגמאות / אפקטים", patternPresets)}

            <div className="space-y-2">
              <p className="text-xs font-medium text-mm-secondary">תמונת רקע משלכם</p>
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                  activePreset === "custom-image"
                    ? "border-mm-primary bg-mm-soft text-mm-primary"
                    : "border-stone-200 bg-white text-mm-secondary hover:border-mm-cta"
                } ${!cutoutBlob || busy || saving ? "pointer-events-none opacity-50" : ""}`}
              >
                {activePreset === "custom-image" ? "רקע מתמונה פעיל" : "העלו תמונת רקע"}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  disabled={busy || saving || !cutoutBlob}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePickBgImage(file);
                    e.currentTarget.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-mm-primary">
                <span className="font-medium">צבע מותאם</span>
                <input
                  type="color"
                  value={customColor}
                  disabled={busy || saving || !cutoutBlob}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setCustomColor(e.target.value);
                    setBgSpec({ kind: "solid", color: e.target.value });
                  }}
                  className="h-9 w-12 cursor-pointer rounded border border-stone-300 bg-white p-1"
                />
              </label>
              <input
                type="text"
                value={customColor}
                disabled={busy || saving || !cutoutBlob}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const next = raw.startsWith("#") ? raw : `#${raw}`;
                  setActivePreset("custom");
                  setCustomColor(next);
                  if (/^#[0-9a-fA-F]{6}$/.test(next)) {
                    setBgSpec({ kind: "solid", color: next });
                  }
                }}
                className={`${adminUi.inputSm} w-28 font-mono text-xs`}
                placeholder="#ffffff"
                aria-label="קוד צבע HEX"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canSave}
              onClick={() => void handleSave()}
              className={adminUi.btnPrimary}
            >
              {saving ? "שומר..." : "שמור תמונה עם הרקע שנבחר"}
            </button>
            <button
              type="button"
              disabled={busy || saving}
              onClick={resetEditor}
              className={adminUi.btnSecondary}
            >
              ביטול עריכה
            </button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className={`text-sm ${adminUi.muted}`}>עדיין אין תמונות שמורות למוצר זה.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {items.map((image, index) => (
            <div key={image.id} className="space-y-1">
              <div className="relative h-28 w-28 overflow-hidden rounded-md border border-stone-200 bg-white">
                <Image
                  src={image.public_url}
                  alt={image.alt_text ?? "product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {index === 0 ? (
                <p className="text-center text-[0.7rem] font-medium text-mm-word">
                  ראשית בקטלוג
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
