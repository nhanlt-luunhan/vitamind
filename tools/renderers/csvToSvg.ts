import Papa from "papaparse";

type CsvShapeType = "circle" | "rect";

export type CsvShape = {
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

export type CsvSvgOptions = {
  width: number;
  height: number;
  viewBox?: string;
  background?: string;
  defaultFill?: string;
  defaultOpacity?: number;
  scale?: number;
};

type CsvParseOutput = {
  rows: CsvShape[];
  errors: string[];
};

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

function sanitizeCssValue(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const cleaned = value.trim();
  if (!cleaned || /[;"<>]/.test(cleaned)) {
    return fallback;
  }
  return cleaned;
}

function normalizeRow(row: Record<string, unknown>): CsvShape | null {
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
    .filter((row): row is CsvShape => Boolean(row));

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
    .filter((row): row is CsvShape => Boolean(row));

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

export async function csvToSvg(csv: string, options: CsvSvgOptions): Promise<string> {
  const {
    width,
    height,
    viewBox,
    background,
    defaultFill = "var(--c-2)",
    defaultOpacity = 1,
    scale = 1,
  } = options;

  const { rows } = await parseCsvShapes(csv);
  const vb = viewBox ?? `0 0 ${width} ${height}`;
  const backgroundFill = background ? sanitizeCssValue(background, "transparent") : null;

  const shapes = rows
    .map((row) => {
      const fill = sanitizeCssValue(row.fill, defaultFill);
      const opacity = row.opacity ?? defaultOpacity;
      const shape = row.shape ?? (row.r ? "circle" : "rect");
      const x = row.x * scale;
      const y = row.y * scale;
      const rotation = row.rotate ?? 0;

      if (shape === "circle") {
        const radius = (row.r ?? 4) * scale;
        if (!Number.isFinite(radius)) return "";
        const transform =
          rotation !== 0 ? ` transform="rotate(${rotation} ${x} ${y})"` : "";
        return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" fill-opacity="${opacity}"${transform} />`;
      }

      const widthValue = (row.width ?? 6) * scale;
      const heightValue = (row.height ?? 6) * scale;
      if (!Number.isFinite(widthValue) || !Number.isFinite(heightValue)) return "";
      const transform =
        rotation !== 0
          ? ` transform="rotate(${rotation} ${x + widthValue / 2} ${y + heightValue / 2})"`
          : "";
      return `<rect x="${x}" y="${y}" width="${widthValue}" height="${heightValue}" rx="2" fill="${fill}" fill-opacity="${opacity}"${transform} />`;
    })
    .filter(Boolean)
    .join("");

  const backgroundLayer = backgroundFill
    ? `<rect width="100%" height="100%" fill="${backgroundFill}" />`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${vb}" role="img">${backgroundLayer}${shapes}</svg>`;
}
