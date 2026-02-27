import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import puppeteer from "puppeteer";

type MediaFormat = "webm" | "gif";

type CliOptions = {
  htmlPath: string;
  csvPath: string;
  outPath: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  format: MediaFormat;
  keepFrames: boolean;
  deviceScaleFactor: number;
};

type MediaMeta = {
  width: number;
  height: number;
  fps: number;
  duration: number;
};

function parseArgs(args: string[]): Partial<CliOptions> {
  const options: Partial<CliOptions> = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (!current.startsWith("--")) continue;

    const key = current.slice(2);
    const next = args[index + 1];

    if (key === "keep-frames") {
      options.keepFrames = true;
      continue;
    }

    if (!next || next.startsWith("--")) continue;

    switch (key) {
      case "html":
        options.htmlPath = next;
        break;
      case "csv":
        options.csvPath = next;
        break;
      case "out":
        options.outPath = next;
        break;
      case "width":
        options.width = Number(next);
        break;
      case "height":
        options.height = Number(next);
        break;
      case "fps":
        options.fps = Number(next);
        break;
      case "duration":
        options.duration = Number(next);
        break;
      case "format":
        options.format = next as MediaFormat;
        break;
      case "scale":
        options.deviceScaleFactor = Number(next);
        break;
      default:
        break;
    }
  }

  return options;
}

function resolveOutputPath(outPath: string, format: MediaFormat) {
  const hasExt = path.extname(outPath).length > 0;
  if (hasExt) return outPath;
  return `${outPath}.${format}`;
}

async function runCommand(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
    });
  });
}

async function encodeWithFfmpeg(
  framesDir: string,
  outPath: string,
  fps: number,
  format: MediaFormat
) {
  const framePattern = path.join(framesDir, "frame-%06d.png");

  if (format === "gif") {
    const palettePath = path.join(framesDir, "palette.png");
    await runCommand("ffmpeg", [
      "-y",
      "-framerate",
      `${fps}`,
      "-i",
      framePattern,
      "-vf",
      "palettegen=stats_mode=diff",
      palettePath,
    ]);

    await runCommand("ffmpeg", [
      "-y",
      "-framerate",
      `${fps}`,
      "-i",
      framePattern,
      "-i",
      palettePath,
      "-lavfi",
      "paletteuse",
      outPath,
    ]);
    return;
  }

  await runCommand("ffmpeg", [
    "-y",
    "-framerate",
    `${fps}`,
    "-i",
    framePattern,
    "-c:v",
    "libvpx-vp9",
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "0",
    "-crf",
    "30",
    outPath,
  ]);
}

async function captureFrames(
  htmlPath: string,
  csvText: string,
  meta: MediaMeta,
  framesDir: string,
  deviceScaleFactor: number
) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({
    width: meta.width,
    height: meta.height,
    deviceScaleFactor,
  });

  await page.evaluateOnNewDocument((csv, options) => {
    (window as unknown as { __CSV__?: string }).__CSV__ = csv;
    (window as unknown as { __MEDIA_META__?: MediaMeta }).__MEDIA_META__ = options;
  }, csvText, meta);

  const htmlUrl = `file://${path.resolve(htmlPath).replace(/\\/g, "/")}`;
  await page.goto(htmlUrl, { waitUntil: "networkidle0" });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page
    .waitForFunction(() => (window as unknown as { __RENDER_READY__?: boolean }).__RENDER_READY__ === true, {
      timeout: 2000,
    })
    .catch(() => undefined);

  const frameCount = Math.max(1, Math.round(meta.duration * meta.fps));

  for (let index = 0; index < frameCount; index += 1) {
    const progress = frameCount === 1 ? 1 : index / (frameCount - 1);
    await page.evaluate(
      (value, frameIndex, total) => {
        const win = window as unknown as {
          __FRAME_PROGRESS__?: number;
          __FRAME_INDEX__?: number;
          __FRAME_COUNT__?: number;
          renderFrame?: (p: number, i: number, t: number) => void;
        };
        win.__FRAME_PROGRESS__ = value;
        win.__FRAME_INDEX__ = frameIndex;
        win.__FRAME_COUNT__ = total;
        if (typeof win.renderFrame === "function") {
          win.renderFrame(value, frameIndex, total);
        }
      },
      progress,
      index,
      frameCount
    );

    const framePath = path.join(framesDir, `frame-${String(index + 1).padStart(6, "0")}.png`);
    await page.screenshot({ path: framePath, type: "png" });
  }

  await browser.close();
}

function printUsage() {
  // eslint-disable-next-line no-console
  console.log(
    [
      "Usage:",
      "  npx tsx scripts/generate-media.ts --html template.html --csv data.csv --out output.webm",
      "",
      "Options:",
      "  --width 1280 --height 720 --fps 30 --duration 3 --format webm|gif --scale 1 --keep-frames",
    ].join("\n")
  );
}

export async function generateMedia() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.htmlPath || !args.csvPath || !args.outPath) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const width = Number.isFinite(args.width) ? args.width ?? 1280 : 1280;
  const height = Number.isFinite(args.height) ? args.height ?? 720 : 720;
  const fps = Number.isFinite(args.fps) ? args.fps ?? 30 : 30;
  const duration = Number.isFinite(args.duration) ? args.duration ?? 3 : 3;
  const format: MediaFormat = args.format === "gif" ? "gif" : "webm";
  const deviceScaleFactor = Number.isFinite(args.deviceScaleFactor) ? args.deviceScaleFactor ?? 1 : 1;
  const outPath = resolveOutputPath(args.outPath, format);

  const csvText = await fs.readFile(args.csvPath, "utf8");
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vitamind-media-"));
  const meta = { width, height, fps, duration };

  try {
    await captureFrames(args.htmlPath, csvText, meta, tempDir, deviceScaleFactor);
    await encodeWithFfmpeg(tempDir, outPath, fps, format);
  } finally {
    if (!args.keepFrames) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}

if (process.argv[1]?.includes("generate-media.ts")) {
  generateMedia().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  });
}
