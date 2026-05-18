export type ToolKind =
  | "select"
  | "text"
  | "draw"
  | "highlight"
  | "rectangle"
  | "whiteout"
  | "cross"
  | "check"
  | "eraser";

export type Color = string;
/**
 * Font families offered by the text editor.
 *
 *   helvetica / times / courier — pdf-lib StandardFonts (no embed needed,
 *   ~0 KB overhead per PDF).
 *   roboto / poppins            — Google Fonts embedded at export time via
 *   @pdf-lib/fontkit; TTF files live in /public/fonts.
 *
 * UI labels (Arial, Times New Roman, Courier New, Roboto, Poppins) are
 * shown via FONT_LABELS — the standard-font internal names are kept for
 * stable serialisation.
 */
export type FontFamily =
  | "helvetica"
  | "times"
  | "courier"
  | "roboto"
  | "poppins";

export type TextAnnotation = {
  id: string;
  type: "text";
  pageIndex: number;
  // Coordinates in CSS pixels of the rendered page canvas.
  x: number;
  y: number;
  text: string;
  fontSize: number; // CSS px
  fontFamily: FontFamily;
  bold: boolean;
  underline: boolean;
  color: Color;
};

export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72,
] as const;

export const FONT_LABELS: Record<FontFamily, string> = {
  helvetica: "Arial",
  times: "Times New Roman",
  courier: "Courier New",
  roboto: "Roboto",
  poppins: "Poppins",
};

export const TEXT_COLOR_PALETTE = [
  "#111827", "#374151", "#6b7280", "#9ca3af",
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#f43f5e", "#ffffff", "#000000",
];

export type DrawAnnotation = {
  id: string;
  type: "draw";
  pageIndex: number;
  points: { x: number; y: number }[];
  color: Color;
  strokeWidth: number;
};

export type HighlightAnnotation = {
  id: string;
  type: "highlight";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
};

export type RectangleAnnotation = {
  id: string;
  type: "rectangle";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
  strokeWidth: number;
};

/**
 * Solid box used to cover existing PDF content. Defaults to white, but the
 * Text Editor samples the background colour from the rendered page so the
 * box blends in when the original text sits on a coloured banner.
 */
export type WhiteoutAnnotation = {
  id: string;
  type: "whiteout";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Hex string. Optional — defaults to white in the renderer and export. */
  color?: string;
};

/** Form-fill marks: a cross (X) or a check (✓) drawn as line strokes. */
export type MarkAnnotation = {
  id: string;
  type: "mark";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "cross" | "check";
  color: Color;
  strokeWidth: number;
};

export type Annotation =
  | TextAnnotation
  | DrawAnnotation
  | HighlightAnnotation
  | RectangleAnnotation
  | WhiteoutAnnotation
  | MarkAnnotation;

export type Rotation = 0 | 90 | 180 | 270;

export type PageType = "text" | "scanned" | "unknown";

/** A page sourced from a loaded PDF file. */
export type PdfPageMeta = {
  kind: "pdf";
  sourceId: string;
  sourceIndex: number;
  rotation: Rotation;
  width: number;
  height: number;
  pageType?: PageType;
};

/** A blank page inserted by the user. */
export type BlankPageMeta = {
  kind: "blank";
  rotation: Rotation;
  width: number;
  height: number;
};

export type PageMeta = PdfPageMeta | BlankPageMeta;

/** Default A4 portrait, in PDF points. */
export const A4_PORTRAIT = { width: 595, height: 842 } as const;
