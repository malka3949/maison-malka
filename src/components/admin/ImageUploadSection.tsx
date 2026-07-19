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
  CANVAS_SIZE_OPTIONS,
  CROP_ASPECT_OPTIONS,
  DEFAULT_PRODUCT_IMAGE_EDIT,
  composeCutoutOnBackground,
  getCropCanvasDimensions,
  paintProductComposite,
  prepareUploadImage,
  previewCss,
  type BgSpec,
  type ProductImageEdit,
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

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <label className="block space-y-1 text-sm text-mm-secondary">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="font-mono text-xs text-mm-primary">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-mm-primary disabled:opacity-50"
      />
    </label>
  );
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
  const objectUrlsRef = useRef<string[]>([]);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activePreset, setActivePreset] = useState("white");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [bgSpec, setBgSpec] = useState<BgSpec>({ kind: "solid", color: "#ffffff" });
  const [edit, setEdit] = useState<ProductImageEdit>(DEFAULT_PRODUCT_IMAGE_EDIT);

  const canSave = Boolean(cutoutBlob) && !busy && !saving;
  const controlsDisabled = busy || saving || !cutoutBlob;

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

  useEffect(() => {
    if (!cutoutBlob) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const previewSize = 360;
    const previewDimensions = getCropCanvasDimensions(
      previewSize,
      edit.cropAspect,
    );
    canvas.width = previewDimensions.width;
    canvas.height = previewDimensions.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previewEdit: ProductImageEdit = { ...edit, canvasSize: 1200 };
    void paintProductComposite(ctx, cutoutBlob, bgSpec, previewEdit).then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [cutoutBlob, bgSpec, edit]);

  function trackObjectUrl(url: string) {
    objectUrlsRef.current.push(url);
    return url;
  }

  function revokeTrackedUrls() {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];
  }

  function patchEdit(partial: Partial<ProductImageEdit>) {
    setEdit((prev) => ({ ...prev, ...partial }));
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
    setActivePreset("white");
    setBgSpec({ kind: "solid", color: "#ffffff" });
    setCustomColor("#ffffff");
    setEdit(DEFAULT_PRODUCT_IMAGE_EDIT);
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
      setStatus("מוכן — ערכו גודל/מיקום/רקע/צל ואז שמרו");
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
      const composed = await composeCutoutOnBackground(cutoutBlob, bgSpec, edit);
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
              disabled={controlsDisabled}
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
          1) בחרו תמונה → 2) ערכו גודל/מיקום/רקע/צל (חינמי בדפדפן) → 3) שמירה. עד{" "}
          {MAX_IMAGE_SIZE_MB}MB.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-mm-line bg-mm-soft/40 px-4 py-8 text-center transition-colors hover:border-mm-cta hover:bg-mm-soft/70">
        <span className="text-sm font-medium text-mm-primary">
          {busy ? "מעבד תמונה..." : "לחצו לבחירת תמונה לעיבוד"}
        </span>
        <span className={`text-xs ${adminUi.muted}`}>
          לא שומרים עדיין — קודם עורכים בתצוגה חיה
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
              <p className="text-xs font-medium text-mm-word">תצוגה חיה (כמו השמירה)</p>
              <div className="flex min-h-40 items-center justify-center rounded-md border border-stone-200 bg-mm-soft/30 p-2">
                {cutoutBlob ? (
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-52 w-full max-w-[22rem] rounded-sm border border-stone-200 bg-white"
                  />
                ) : (
                  <p className={`text-sm ${adminUi.muted}`}>
                    {busy ? "מעבד..." : "ממתין לתמונה"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-stone-100 bg-mm-soft/30 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-mm-primary">
                חיתוך, גודל ומיקום
              </p>
              <button
                type="button"
                disabled={controlsDisabled}
                onClick={() => setEdit(DEFAULT_PRODUCT_IMAGE_EDIT)}
                className={adminUi.btnSecondary}
              >
                איפוס עריכה
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-mm-secondary">
                יחס מסגרת החיתוך
              </p>
              <div className="flex flex-wrap gap-2">
                {CROP_ASPECT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={controlsDisabled}
                    onClick={() => patchEdit({ cropAspect: option.value })}
                    className={`rounded-md border px-2.5 py-1.5 text-xs ${
                      edit.cropAspect === option.value
                        ? "border-mm-primary bg-white text-mm-primary"
                        : "border-stone-200 bg-white text-mm-secondary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-mm-secondary">
                הגדילו והזיזו את המוצר כדי לבחור בדיוק מה יישאר בתוך המסגרת.
              </p>
            </div>
            <SliderRow
              label="הגדלה / הקטנה"
              value={Math.round(edit.scale * 100)}
              min={40}
              max={160}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ scale: v / 100 })}
              display={`${Math.round(edit.scale * 100)}%`}
            />
            <SliderRow
              label="הזזה אופקית"
              value={Math.round(edit.offsetX * 100)}
              min={-45}
              max={45}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ offsetX: v / 100 })}
              display={`${edit.offsetX >= 0 ? "+" : ""}${Math.round(edit.offsetX * 100)}%`}
            />
            <SliderRow
              label="הזזה אנכית"
              value={Math.round(edit.offsetY * 100)}
              min={-45}
              max={45}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ offsetY: v / 100 })}
              display={`${edit.offsetY >= 0 ? "+" : ""}${Math.round(edit.offsetY * 100)}%`}
            />
            <SliderRow
              label="ריפוד (אוויר מסביב)"
              value={Math.round(edit.padding * 100)}
              min={0}
              max={25}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ padding: v / 100 })}
              display={`${Math.round(edit.padding * 100)}%`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-mm-secondary">
                גודל הצלע הארוכה:
              </span>
              {CANVAS_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() => patchEdit({ canvasSize: size })}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    edit.canvasSize === size
                      ? "border-mm-primary bg-white text-mm-primary"
                      : "border-stone-200 bg-white text-mm-secondary"
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-stone-100 bg-mm-soft/30 p-3">
            <p className="text-sm font-medium text-mm-primary">סיבוב והיפוך</p>
            <SliderRow
              label="סיבוב"
              value={edit.rotationDeg}
              min={-180}
              max={180}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ rotationDeg: v })}
              display={`${edit.rotationDeg}°`}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={controlsDisabled}
                onClick={() =>
                  patchEdit({
                    rotationDeg: ((edit.rotationDeg - 90 + 540) % 360) - 180,
                  })
                }
                className={adminUi.btnSecondary}
              >
                90° שמאלה
              </button>
              <button
                type="button"
                disabled={controlsDisabled}
                onClick={() =>
                  patchEdit({
                    rotationDeg: ((edit.rotationDeg + 90 + 540) % 360) - 180,
                  })
                }
                className={adminUi.btnSecondary}
              >
                90° ימינה
              </button>
              <button
                type="button"
                disabled={controlsDisabled}
                onClick={() => patchEdit({ flipX: !edit.flipX })}
                className={`${adminUi.btnSecondary} ${edit.flipX ? "ring-1 ring-mm-primary" : ""}`}
              >
                היפוך אופקי {edit.flipX ? "(פעיל)" : ""}
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-stone-100 bg-mm-soft/30 p-3">
            <p className="text-sm font-medium text-mm-primary">צל סטודיו</p>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-mm-secondary">
              <input
                type="checkbox"
                checked={edit.shadowEnabled}
                disabled={controlsDisabled}
                onChange={(e) => patchEdit({ shadowEnabled: e.target.checked })}
              />
              הפעל צל רך מתחת למוצר
            </label>
            <SliderRow
              label="עוצמת צל"
              value={Math.round(edit.shadowOpacity * 100)}
              min={5}
              max={60}
              step={1}
              disabled={controlsDisabled || !edit.shadowEnabled}
              onChange={(v) => patchEdit({ shadowOpacity: v / 100 })}
              display={`${Math.round(edit.shadowOpacity * 100)}%`}
            />
            <SliderRow
              label="טשטוש צל"
              value={edit.shadowBlur}
              min={4}
              max={60}
              step={1}
              disabled={controlsDisabled || !edit.shadowEnabled}
              onChange={(v) => patchEdit({ shadowBlur: v })}
              display={`${edit.shadowBlur}px`}
            />
            <SliderRow
              label="הזזת צל למטה"
              value={edit.shadowOffsetY}
              min={0}
              max={40}
              step={1}
              disabled={controlsDisabled || !edit.shadowEnabled}
              onChange={(v) => patchEdit({ shadowOffsetY: v })}
              display={`${edit.shadowOffsetY}px`}
            />
          </div>

          <div className="space-y-3 rounded-md border border-stone-100 bg-mm-soft/30 p-3">
            <p className="text-sm font-medium text-mm-primary">ליטוש צבע</p>
            <SliderRow
              label="בהירות"
              value={edit.brightness}
              min={-30}
              max={30}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ brightness: v })}
              display={`${edit.brightness >= 0 ? "+" : ""}${edit.brightness}`}
            />
            <SliderRow
              label="ניגודיות"
              value={edit.contrast}
              min={-20}
              max={20}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ contrast: v })}
              display={`${edit.contrast >= 0 ? "+" : ""}${edit.contrast}`}
            />
            <SliderRow
              label="רוויה"
              value={edit.saturation}
              min={-30}
              max={30}
              step={1}
              disabled={controlsDisabled}
              onChange={(v) => patchEdit({ saturation: v })}
              display={`${edit.saturation >= 0 ? "+" : ""}${edit.saturation}`}
            />
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
                } ${controlsDisabled ? "pointer-events-none opacity-50" : ""}`}
              >
                {activePreset === "custom-image" ? "רקע מתמונה פעיל" : "העלו תמונת רקע"}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  disabled={controlsDisabled}
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
                  disabled={controlsDisabled}
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
                disabled={controlsDisabled}
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
              {saving ? "שומר..." : "שמור תמונה מעובדת"}
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
