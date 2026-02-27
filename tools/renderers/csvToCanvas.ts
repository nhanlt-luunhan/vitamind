import Papa from "papaparse";

type CsvShapeType = "circle" | "rect";

export type CsvCanvasShape = {
  x: number;
  y: number;
  r?: number;
  width?: number;
  height?: number;
  fill?: string;
  opacity?: number;
  shape?: CsvShapeType;
  rotate?: number;
};

export type CsvCanvasOptions = {
  width: number;
  height: number;
  background?: string;
  defaultFill?: string;
  defaultOpacity?: number;
  scale?: number;
  clear?: boolean;
};

type CsvParseOutput = {
  rows: CsvCanvasShape[];
  errors: string[];
};

function resolveCanvasColor(
  context: CanvasRenderingContext2D,
  value: string,
  fallback: string
): string {
  if (!value) return fallback;
  if (!value.startsWith("var(")) {
    return value;
  }

  const tokenMatch = value.match(/var\((--[^)]+)\)/);
  if (!tokenMatch) return fallback;

  const token = tokenMatch[1];
  const view = context.canvas.ownerDocument?.defaultView;
  const root = context.canvas.ownerDocument?.documentElement;
  if (!view || !root) return fallback;

  const computed = view.getComputedStyle(root).getPropertyValue(token).trim();
  return computed || fallback;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}`;
  }
  return undefined;
}

function normalizeRow(row: Record<string, unknown>): CsvCanvasShape | null {
  const x = toNumber(row.x ?? row.X);
  const y = toNumber(row.y ?? row.Y);

  if (x === undefined || y === undefined) {
    return null;
  }

  const shape = toStringValue(row.shape)?.toLowerCase() as CsvShapeType | undefined;
  const r = toNumber(row.r ?? row.radius);
  const width = toNumber(row.width ?? row.w);
  const height = toNumber(row.height ?? row.h);
  const opacity = toNumber(row.opacity);
  const rotate = toNumber(row.rotate ?? row.rotation);
  const fill = toStringValue(row.fill ?? row.color);

  return {
    x,
    y,
    r,
    width,
    height,
    opacity,
    rotate,
    fill,
    shape,
  };
}

function parseCsvWithHeader(csv: string): CsvParseOutput {
  const result = Papa.parse<Record<string, unknown>>(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const rows = result.data
    .map((row) => normalizeRow(row))
    .filter((row): row is CsvCanvasShape => Boolean(row));

  return {
    rows,
    errors: result.errors.map((error) => error.message),
  };
}

function parseCsvWithoutHeader(csv: string): CsvParseOutput {
  const result = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const rows = (result.data || [])
    .map((row) => {
      if (!row || row.length < 2) return null;
      const [x, y, r, fill, opacity, width, height, shape, rotate] = row;
      return normalizeRow({
        x,
        y,
        r,
        fill,
        opacity,
        width,
        height,
        shape,
        rotate,
      });
    })
    .filter((row): row is CsvCanvasShape => Boolean(row));

  return {
    rows,
    errors: result.errors.map((error) => error.message),
  };
}

export async function parseCsvShapes(csv: string): Promise<CsvParseOutput> {
  const withHeader = parseCsvWithHeader(csv);
  if (withHeader.rows.length) {
    return withHeader;
  }
  return parseCsvWithoutHeader(csv);
}

export async function renderCsvToCanvas(
  csv: string,
  context: CanvasRenderingContext2D,
  options: CsvCanvasOptions
): Promise<void> {
  const {
    width,
    height,
    background,
    defaultFill = "var(--c-2)",
    defaultOpacity = 1,
    scale = 1,
    clear = true,
  } = options;

  const { rows } = await parseCsvShapes(csv);
  const fallbackFill = resolveCanvasColor(context, defaultFill, defaultFill);

  if (clear) {
    context.clearRect(0, 0, width, height);
  }

  if (background) {
    context.save();
    context.fillStyle = resolveCanvasColor(context, background, background);
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  rows.forEach((row) => {
    const fill = resolveCanvasColor(context, row.fill ?? fallbackFill, fallbackFill);
    const opacity = row.opacity ?? defaultOpacity;
    const shape = row.shape ?? (row.r ? "circle" : "rect");

    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = fill;

    if (shape === "circle") {
      const radius = (row.r ?? 4) * scale;
      const x = row.x * scale;
      const y = row.y * scale;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
      return;
    }

    const widthValue = (row.width ?? 6) * scale;
    const heightValue = (row.height ?? 6) * scale;
    const x = row.x * scale;
    const y = row.y * scale;
    const rotate = row.rotate ?? 0;

    if (rotate !== 0) {
      context.translate(x + widthValue / 2, y + heightValue / 2);
      context.rotate((rotate * Math.PI) / 180);
      context.fillRect(-widthValue / 2, -heightValue / 2, widthValue, heightValue);
    } else {
      context.fillRect(x, y, widthValue, heightValue);
    }

    context.restore();
  });
}
