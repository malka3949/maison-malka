/**
 * Free browser-only product background presets (Canvas 2D — no paid APIs).
 */

import type { CSSProperties } from "react";

export type PatternId =
  | "linen"
  | "dots"
  | "paper"
  | "mesh"
  | "wood"
  | "marble"
  | "stripes"
  | "vignette";

export type BgSpec =
  | { kind: "transparent" }
  | { kind: "solid"; color: string }
  | {
      kind: "gradient";
      mode: "linear" | "radial";
      colors: [string, string] | [string, string, string];
      angleDeg?: number;
    }
  | { kind: "pattern"; pattern: PatternId; base: string }
  | { kind: "image"; objectUrl: string; cover?: boolean };

export type BgPreset = {
  id: string;
  label: string;
  group: "solid" | "gradient" | "pattern";
  spec: BgSpec;
};

export const BG_PRESETS: BgPreset[] = [
  // Solids
  { id: "white", label: "לבן", group: "solid", spec: { kind: "solid", color: "#ffffff" } },
  { id: "cream", label: "קרם", group: "solid", spec: { kind: "solid", color: "#efece8" } },
  { id: "soft", label: "בז׳", group: "solid", spec: { kind: "solid", color: "#f7f3ec" } },
  { id: "sand", label: "חול", group: "solid", spec: { kind: "solid", color: "#e8dfd2" } },
  { id: "stone", label: "אבן", group: "solid", spec: { kind: "solid", color: "#d6d3d1" } },
  { id: "gray", label: "אפור בהיר", group: "solid", spec: { kind: "solid", color: "#f3f4f6" } },
  { id: "charcoal", label: "פחם", group: "solid", spec: { kind: "solid", color: "#292524" } },
  { id: "black", label: "שחור", group: "solid", spec: { kind: "solid", color: "#111111" } },
  { id: "transparent", label: "שקוף", group: "solid", spec: { kind: "transparent" } },

  // Gradients
  {
    id: "grad-cream",
    label: "גרדיאנט קרם",
    group: "gradient",
    spec: { kind: "gradient", mode: "linear", colors: ["#f7f3ec", "#ffffff"], angleDeg: 180 },
  },
  {
    id: "grad-warm",
    label: "גרדיאנט חם",
    group: "gradient",
    spec: { kind: "gradient", mode: "linear", colors: ["#f3e8dc", "#ebe0d4"], angleDeg: 135 },
  },
  {
    id: "grad-butter",
    label: "חמאה רכה",
    group: "gradient",
    spec: { kind: "gradient", mode: "linear", colors: ["#fff7e8", "#f3e6c8", "#ebe0c8"], angleDeg: 170 },
  },
  {
    id: "grad-studio",
    label: "סטודיו רך",
    group: "gradient",
    spec: { kind: "gradient", mode: "linear", colors: ["#f5f5f4", "#e7e5e4"], angleDeg: 160 },
  },
  {
    id: "grad-dusk",
    label: "שקיעה עדינה",
    group: "gradient",
    spec: { kind: "gradient", mode: "linear", colors: ["#f6ebe3", "#e8d5c8", "#dccfc4"], angleDeg: 200 },
  },
  {
    id: "grad-mint-soft",
    label: "ירוק עדין",
    group: "gradient",
    spec: { kind: "gradient", mode: "linear", colors: ["#f2f5f1", "#e4ebe3"], angleDeg: 150 },
  },
  {
    id: "grad-spotlight",
    label: "זרקור רך",
    group: "gradient",
    spec: { kind: "gradient", mode: "radial", colors: ["#fffdf9", "#eae4dc"] },
  },
  {
    id: "grad-halo",
    label: "הילה סטודיו",
    group: "gradient",
    spec: { kind: "gradient", mode: "radial", colors: ["#ffffff", "#f0ebe4", "#ddd6ce"] },
  },

  // Patterns / effects
  {
    id: "pat-linen",
    label: "בד פשתן",
    group: "pattern",
    spec: { kind: "pattern", pattern: "linen", base: "#f4f0ea" },
  },
  {
    id: "pat-dots",
    label: "נקודות עדינות",
    group: "pattern",
    spec: { kind: "pattern", pattern: "dots", base: "#f7f5f2" },
  },
  {
    id: "pat-paper",
    label: "נייר טקסטורה",
    group: "pattern",
    spec: { kind: "pattern", pattern: "paper", base: "#f6f3ee" },
  },
  {
    id: "pat-mesh",
    label: "רשת עדינה",
    group: "pattern",
    spec: { kind: "pattern", pattern: "mesh", base: "#f3f1ed" },
  },
  {
    id: "pat-wood",
    label: "עץ בהיר",
    group: "pattern",
    spec: { kind: "pattern", pattern: "wood", base: "#e9dcc8" },
  },
  {
    id: "pat-marble",
    label: "שיש רך",
    group: "pattern",
    spec: { kind: "pattern", pattern: "marble", base: "#f4f2ef" },
  },
  {
    id: "pat-stripes",
    label: "פסים עדינים",
    group: "pattern",
    spec: { kind: "pattern", pattern: "stripes", base: "#f7f4ef" },
  },
  {
    id: "pat-vignette",
    label: "צל סטודיו",
    group: "pattern",
    spec: { kind: "pattern", pattern: "vignette", base: "#f5f2ec" },
  },
];

function coverDraw(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
) {
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const dw = bitmap.width * scale;
  const dh = bitmap.height * scale;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  ctx.drawImage(bitmap, dx, dy, dw, dh);
}

export async function paintBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spec: BgSpec,
): Promise<void> {
  if (spec.kind === "transparent") {
    return;
  }

  if (spec.kind === "solid") {
    ctx.fillStyle = spec.color;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (spec.kind === "image") {
    const bitmap = await createImageBitmap(await (await fetch(spec.objectUrl)).blob());
    coverDraw(ctx, bitmap, width, height);
    bitmap.close();
    return;
  }

  if (spec.kind === "gradient") {
    const colors = spec.colors;
    if (spec.mode === "radial") {
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        Math.min(width, height) * 0.08,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72,
      );
      colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const angle = ((spec.angleDeg ?? 180) * Math.PI) / 180;
    const x0 = width / 2 - (Math.cos(angle) * width) / 2;
    const y0 = height / 2 - (Math.sin(angle) * height) / 2;
    const x1 = width / 2 + (Math.cos(angle) * width) / 2;
    const y1 = height / 2 + (Math.sin(angle) * height) / 2;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Patterns
  ctx.fillStyle = spec.base;
  ctx.fillRect(0, 0, width, height);

  if (spec.pattern === "linen") {
    ctx.strokeStyle = "rgba(120, 100, 80, 0.07)";
    ctx.lineWidth = 1;
    const step = Math.max(6, Math.round(Math.min(width, height) / 80));
    for (let x = -height; x < width + height; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(120, 100, 80, 0.045)";
    for (let x = -height; x < width + height; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + height, 0);
      ctx.stroke();
    }
    return;
  }

  if (spec.pattern === "dots") {
    const step = Math.max(10, Math.round(Math.min(width, height) / 45));
    const r = Math.max(1.2, step * 0.12);
    ctx.fillStyle = "rgba(90, 80, 70, 0.12)";
    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return;
  }

  if (spec.pattern === "paper") {
    const count = Math.min(12_000, Math.floor((width * height) / 28));
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const a = 0.02 + Math.random() * 0.05;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(80,70,60,${a})` : `rgba(255,255,255,${a})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    return;
  }

  if (spec.pattern === "mesh") {
    const step = Math.max(12, Math.round(Math.min(width, height) / 40));
    ctx.strokeStyle = "rgba(100, 90, 80, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    return;
  }

  if (spec.pattern === "wood") {
    const bands = Math.max(18, Math.round(height / 28));
    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * height;
      const h = height / bands + 2;
      const shade = i % 2 === 0 ? "rgba(120,90,50,0.06)" : "rgba(255,245,230,0.12)";
      ctx.fillStyle = shade;
      ctx.fillRect(0, y, width, h);
      ctx.strokeStyle = "rgba(110,85,50,0.05)";
      ctx.beginPath();
      ctx.moveTo(0, y + h * 0.4);
      for (let x = 0; x < width; x += 24) {
        ctx.lineTo(x + 12, y + h * 0.4 + Math.sin(x * 0.04 + i) * 3);
        ctx.lineTo(x + 24, y + h * 0.4);
      }
      ctx.stroke();
    }
    return;
  }

  if (spec.pattern === "marble") {
    ctx.strokeStyle = "rgba(130,120,110,0.18)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      const y0 = (height * (i + 1)) / 9;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= width; x += 20) {
        const y =
          y0 +
          Math.sin(x * 0.012 + i * 1.7) * (height * 0.04) +
          Math.sin(x * 0.035 + i) * 8;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(180,175,168,0.22)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const x0 = (width * (i + 1)) / 7;
      ctx.moveTo(x0, 0);
      for (let y = 0; y <= height; y += 18) {
        ctx.lineTo(x0 + Math.sin(y * 0.02 + i) * 18, y);
      }
      ctx.stroke();
    }
    return;
  }

  if (spec.pattern === "stripes") {
    const step = Math.max(10, Math.round(Math.min(width, height) / 35));
    ctx.fillStyle = "rgba(120,100,80,0.06)";
    for (let x = 0; x < width; x += step * 2) {
      ctx.fillRect(x, 0, step, height);
    }
    return;
  }

  if (spec.pattern === "vignette") {
    const g = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      Math.min(width, height) * 0.25,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.78,
    );
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.55, "rgba(40,30,20,0.04)");
    g.addColorStop(1, "rgba(30,22,16,0.28)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
}

/** CSS preview approximating the baked canvas background (live panel). */
export function previewCss(spec: BgSpec): CSSProperties {
  if (spec.kind === "transparent") {
    return {
      backgroundImage:
        "linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)",
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
    };
  }

  if (spec.kind === "solid") {
    return { backgroundColor: spec.color };
  }

  if (spec.kind === "image") {
    return {
      backgroundImage: `url(${spec.objectUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  if (spec.kind === "gradient") {
    const colors = spec.colors.join(", ");
    if (spec.mode === "radial") {
      return {
        backgroundImage: `radial-gradient(circle at 50% 42%, ${colors})`,
      };
    }
    return {
      backgroundImage: `linear-gradient(${spec.angleDeg ?? 180}deg, ${colors})`,
    };
  }

  if (spec.pattern === "linen") {
    return {
      backgroundColor: spec.base,
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(120,100,80,0.07) 0 1px, transparent 1px 8px), repeating-linear-gradient(-45deg, rgba(120,100,80,0.045) 0 1px, transparent 1px 8px)",
    };
  }

  if (spec.pattern === "dots") {
    return {
      backgroundColor: spec.base,
      backgroundImage: "radial-gradient(rgba(90,80,70,0.14) 1.2px, transparent 1.3px)",
      backgroundSize: "14px 14px",
    };
  }

  if (spec.pattern === "paper") {
    return {
      backgroundColor: spec.base,
      backgroundImage:
        "radial-gradient(rgba(80,70,60,0.04) 0.6px, transparent 0.7px), radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.7px)",
      backgroundSize: "3px 3px, 5px 5px",
      backgroundPosition: "0 0, 1px 2px",
    };
  }

  if (spec.pattern === "mesh") {
    return {
      backgroundColor: spec.base,
      backgroundImage:
        "linear-gradient(rgba(100,90,80,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,90,80,0.08) 1px, transparent 1px)",
      backgroundSize: "14px 14px",
    };
  }

  if (spec.pattern === "wood") {
    return {
      backgroundColor: spec.base,
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(120,90,50,0.07) 0 10px, rgba(255,245,230,0.1) 10px 20px)",
    };
  }

  if (spec.pattern === "marble") {
    return {
      backgroundColor: spec.base,
      backgroundImage:
        "radial-gradient(ellipse at 20% 30%, rgba(130,120,110,0.12), transparent 45%), radial-gradient(ellipse at 70% 60%, rgba(160,150,140,0.1), transparent 40%)",
    };
  }

  if (spec.pattern === "stripes") {
    return {
      backgroundColor: spec.base,
      backgroundImage:
        "repeating-linear-gradient(90deg, rgba(120,100,80,0.07) 0 8px, transparent 8px 16px)",
    };
  }

  // vignette
  return {
    backgroundColor: spec.base,
    backgroundImage:
      "radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 35%, rgba(30,22,16,0.28) 100%)",
  };
}

/** Free local transform / polish controls (Canvas only — no paid APIs). */
export type ProductImageEdit = {
  /** Product size relative to fit-in-frame (0.4–1.6). */
  scale: number;
  /** Horizontal shift as fraction of canvas (−0.5…0.5). */
  offsetX: number;
  /** Vertical shift as fraction of canvas (−0.5…0.5). */
  offsetY: number;
  /** Inner margin as fraction of canvas edge (0–0.25). */
  padding: number;
  rotationDeg: number; // −180…180
  flipX: boolean;
  /** −30…+30 → mapped to CSS filter percent. */
  brightness: number;
  contrast: number;
  saturation: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffsetY: number;
  canvasSize: 800 | 1200 | 1600;
  /** Output crop frame. Scale + offsets position the product inside it. */
  cropAspect: "1:1" | "4:3" | "3:4" | "16:9";
};

export const DEFAULT_PRODUCT_IMAGE_EDIT: ProductImageEdit = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  padding: 0.08,
  rotationDeg: 0,
  flipX: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  shadowEnabled: true,
  shadowBlur: 28,
  shadowOpacity: 0.28,
  shadowOffsetY: 18,
  canvasSize: 1200,
  cropAspect: "1:1",
};

export const CANVAS_SIZE_OPTIONS: Array<ProductImageEdit["canvasSize"]> = [
  800, 1200, 1600,
];

export const CROP_ASPECT_OPTIONS: Array<{
  value: ProductImageEdit["cropAspect"];
  label: string;
}> = [
  { value: "1:1", label: "ריבוע 1:1" },
  { value: "4:3", label: "רוחב 4:3" },
  { value: "3:4", label: "גובה 3:4" },
  { value: "16:9", label: "רחב 16:9" },
];

export function getCropCanvasDimensions(
  size: number,
  aspect: ProductImageEdit["cropAspect"],
): { width: number; height: number } {
  if (aspect === "4:3") {
    return { width: size, height: Math.round((size * 3) / 4) };
  }
  if (aspect === "3:4") {
    return { width: Math.round((size * 3) / 4), height: size };
  }
  if (aspect === "16:9") {
    return { width: size, height: Math.round((size * 9) / 16) };
  }
  return { width: size, height: size };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function editFilterCss(edit: ProductImageEdit): string {
  const b = clamp(100 + edit.brightness, 40, 160);
  const c = clamp(100 + edit.contrast, 50, 160);
  const s = clamp(100 + edit.saturation, 0, 200);
  return `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
}

/**
 * Paint background + transformed cutout onto an existing canvas context.
 * Used for live preview and final export (same path).
 */
export async function paintProductComposite(
  ctx: CanvasRenderingContext2D,
  cutout: Blob | ImageBitmap,
  spec: BgSpec,
  edit: ProductImageEdit = DEFAULT_PRODUCT_IMAGE_EDIT,
): Promise<void> {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  await paintBackground(ctx, width, height, spec);

  const bitmap =
    cutout instanceof ImageBitmap
      ? cutout
      : await createImageBitmap(cutout);
  const ownsBitmap = !(cutout instanceof ImageBitmap);

  const pad = clamp(edit.padding, 0, 0.25);
  const inner = Math.min(width, height) * (1 - pad * 2);
  const fit = Math.min(inner / bitmap.width, inner / bitmap.height);
  const drawScale = fit * clamp(edit.scale, 0.4, 1.6);
  const dw = bitmap.width * drawScale;
  const dh = bitmap.height * drawScale;
  const cx = width / 2 + clamp(edit.offsetX, -0.5, 0.5) * width;
  const cy = height / 2 + clamp(edit.offsetY, -0.5, 0.5) * height;
  const rad = (edit.rotationDeg * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);
  if (edit.flipX) ctx.scale(-1, 1);

  if (edit.shadowEnabled && spec.kind !== "transparent") {
    ctx.shadowColor = `rgba(28, 22, 16, ${clamp(edit.shadowOpacity, 0, 0.8)})`;
    ctx.shadowBlur = clamp(edit.shadowBlur, 0, 80);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = clamp(edit.shadowOffsetY, 0, 60);
  }

  ctx.filter = editFilterCss(edit);
  ctx.drawImage(bitmap, -dw / 2, -dh / 2, dw, dh);
  ctx.filter = "none";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.restore();

  if (ownsBitmap) bitmap.close();
}

export async function composeCutoutOnBackground(
  cutout: Blob,
  spec: BgSpec,
  edit: ProductImageEdit = DEFAULT_PRODUCT_IMAGE_EDIT,
): Promise<Blob> {
  const dimensions = getCropCanvasDimensions(
    edit.canvasSize,
    edit.cropAspect,
  );
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("לא ניתן לעבד את התמונה בדפדפן");
  }

  await paintProductComposite(ctx, cutout, spec, edit);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("יצירת תמונה נכשלה"))),
      "image/png",
      0.92,
    );
  });
}

const MAX_UPLOAD_EDGE = 2000;

/**
 * Downscale + re-encode so rembg PNG output stays under the upload limit.
 * Transparent stays PNG; otherwise JPEG (much smaller) is preferred.
 */
export async function prepareUploadImage(
  blob: Blob,
  opts: { keepAlpha: boolean; maxBytes: number },
): Promise<{ blob: Blob; filename: string; mime: string }> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("לא ניתן לדחוס את התמונה");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("דחיסת תמונה נכשלה"))),
        type,
        quality,
      );
    });

  if (opts.keepAlpha) {
    let out = await toBlob("image/png");
    if (out.size > opts.maxBytes && Math.max(width, height) > 1200) {
      const s2 = 1200 / Math.max(width, height);
      const c2 = document.createElement("canvas");
      c2.width = Math.max(1, Math.round(width * s2));
      c2.height = Math.max(1, Math.round(height * s2));
      const x2 = c2.getContext("2d");
      if (!x2) throw new Error("לא ניתן לדחוס את התמונה");
      x2.drawImage(canvas, 0, 0, c2.width, c2.height);
      out = await new Promise<Blob>((resolve, reject) => {
        c2.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("דחיסת תמונה נכשלה"))),
          "image/png",
        );
      });
    }
    if (out.size > opts.maxBytes) {
      throw new Error(
        `התמונה אחרי עיבוד גדולה מדי (${(out.size / (1024 * 1024)).toFixed(1)}MB). נסו קובץ קטן יותר או רקע לא-שקוף.`,
      );
    }
    return { blob: out, filename: "product-edited.png", mime: "image/png" };
  }

  for (const q of [0.88, 0.78, 0.68]) {
    const out = await toBlob("image/jpeg", q);
    if (out.size <= opts.maxBytes) {
      return { blob: out, filename: "product-edited.jpg", mime: "image/jpeg" };
    }
  }

  throw new Error(
    `התמונה אחרי עיבוד גדולה מדי. נסו קובץ מקור קטן יותר (מקסימום ${(opts.maxBytes / (1024 * 1024)).toFixed(0)}MB).`,
  );
}
