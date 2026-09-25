import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import { writeFile, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";

// Allow up to 10 minutes — 3 FFmpeg passes on large videos
export const maxDuration = 600;
export const dynamic = "force-dynamic";

// ── Quality presets ───────────────────────────────────────────────────────────
const QUALITY_PRESETS: Record<string, { scale: string; crf: number; label: string }> = {
  "360p":  { scale: "scale=-2:min(360\\,ih)",  crf: 32, label: "360p  (mobile data)" },
  "720p":  { scale: "scale=-2:min(720\\,ih)",  crf: 28, label: "720p  (HD)"          },
  "1080p": { scale: "scale=-2:min(1080\\,ih)", crf: 23, label: "1080p (Full HD)"      },
};

// ── Locate system FFmpeg ──────────────────────────────────────────────────────
const FFMPEG_PATHS = [
  "/opt/homebrew/bin/ffmpeg",   // macOS Homebrew (Apple Silicon)
  "/usr/local/bin/ffmpeg",      // macOS Homebrew (Intel) / Linux
  "/usr/bin/ffmpeg",            // Linux apt/yum
  "ffmpeg",                     // PATH fallback
];

function findFfmpeg(): string {
  for (const p of FFMPEG_PATHS) {
    if (p === "ffmpeg") return p;
    if (existsSync(p)) return p;
  }
  return "ffmpeg";
}

const FFMPEG_BIN = findFfmpeg();

// ── Pretty logger ─────────────────────────────────────────────────────────────
function log(emoji: string, msg: string, extra?: Record<string, unknown>) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 23);
  const extras = extra ? "  " + JSON.stringify(extra) : "";
  console.log(`[Compressify ${ts}] ${emoji}  ${msg}${extras}`);
}

function mb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];
  const startedAt = Date.now();

  try {
    // ── 1. Parse multipart form ───────────────────────────────────────────
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;

    if (!videoFile) {
      log("❌", "No video file in request — field name must be 'video'");
      return NextResponse.json(
        { error: "No video file provided. Send field name: 'video'" },
        { status: 400 }
      );
    }

    // ── 2. Resolve quality ────────────────────────────────────────────────
    const qualityParam = request.nextUrl.searchParams.get("quality") ?? "720p";
    const preset = QUALITY_PRESETS[qualityParam] ?? QUALITY_PRESETS["720p"];

    // ── 3. Log incoming request ───────────────────────────────────────────
    console.log("");
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log(`║  🎬  COMPRESSIFY  —  NEW REQUEST                         ║`);
    console.log("╚══════════════════════════════════════════════════════════╝");
    log("📥", "Incoming video", {
      name:    videoFile.name,
      size:    mb(videoFile.size),
      type:    videoFile.type || "unknown",
      quality: qualityParam,
      preset:  preset.label,
      ffmpeg:  FFMPEG_BIN,
    });

    // ── 4. Write to temp file ─────────────────────────────────────────────
    const tmpDir     = os.tmpdir();
    const stamp      = Date.now();
    const inputExt   = (videoFile.name.split(".").pop() || "mp4").toLowerCase();
    const inputPath  = path.join(tmpDir, `compressify_in_${stamp}.${inputExt}`);
    const outputPath = path.join(tmpDir, `compressify_out_${stamp}.mp4`);
    tempFiles.push(inputPath, outputPath);

    log("💾", `Saving upload to temp file: ${inputPath}`);
    const inputBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(inputPath, inputBuffer);
    log("✅", `Temp file written (${mb(inputBuffer.length)})`);

    // ── 5. Run FFmpeg ─────────────────────────────────────────────────────
    log("⚙️ ", `Starting FFmpeg  [CRF ${preset.crf}  |  ${preset.scale}]`);
    const ffmpegStart = Date.now();

    await new Promise<void>((resolve, reject) => {
      let lastPercent = -1;

      ffmpeg(inputPath)
        .setFfmpegPath(FFMPEG_BIN)
        .videoCodec("libx264")
        .addOption("-preset", "veryfast")
        .addOption("-crf",    String(preset.crf))
        .addOption("-vf",     preset.scale)
        .audioCodec("aac")
        .audioBitrate("128k")
        .addOption("-movflags", "faststart")
        .addOption("-y")
        .output(outputPath)
        .on("start", (cmd) => {
          log("🚀", "FFmpeg started");
          log("🔧", `Command: ${cmd}`);
        })
        .on("codecData", (data) => {
          log("📊", "Input stream info", {
            format:    data.format,
            video:     data.video,
            audio:     data.audio,
            duration:  data.duration,
          });
        })
        .on("progress", (p) => {
          const pct = Math.floor(p.percent ?? 0);
          // Print every 10% to avoid log spam
          if (pct >= lastPercent + 10) {
            lastPercent = pct;
            log("⏳", `Encoding progress: ${pct}%`, {
              fps:       p.currentFps,
              bitrate:   p.currentKbps ? p.currentKbps + " kbps" : "—",
              timemark:  p.timemark,
            });
          }
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    const ffmpegMs = Date.now() - ffmpegStart;

    // ── 6. Read output ────────────────────────────────────────────────────
    const outputBuffer = await readFile(outputPath);
    const reduction    = (((videoFile.size - outputBuffer.length) / videoFile.size) * 100).toFixed(1);

    console.log("");
    log("✅", "FFmpeg compression complete", {
      quality:    qualityParam,
      input:      mb(videoFile.size),
      output:     mb(outputBuffer.length),
      reduction:  reduction + "%",
      duration:   (ffmpegMs / 1000).toFixed(1) + "s",
      totalTime:  ((Date.now() - startedAt) / 1000).toFixed(1) + "s",
    });
    console.log("──────────────────────────────────────────────────────────");
    console.log("");

    // ── 7. Clean up ───────────────────────────────────────────────────────
    await cleanupFiles(tempFiles);

    // ── 8. Return compressed binary ───────────────────────────────────────
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "video/mp4",
        "Content-Disposition": `attachment; filename="compressed_${qualityParam}.mp4"`,
        "Content-Length":      outputBuffer.length.toString(),
        "X-Original-Size":     videoFile.size.toString(),
        "X-Compressed-Size":   outputBuffer.length.toString(),
        "X-Reduction-Percent": reduction,
        "X-Quality":           qualityParam,
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error: unknown) {
    await cleanupFiles(tempFiles);
    const message = error instanceof Error ? error.message : String(error);

    console.log("");
    log("❌", "Compression FAILED", {
      error:     message,
      totalTime: ((Date.now() - startedAt) / 1000).toFixed(1) + "s",
    });
    console.log("──────────────────────────────────────────────────────────");
    console.log("");

    return NextResponse.json(
      { error: "Compression failed", details: message },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

async function cleanupFiles(files: string[]): Promise<void> {
  await Promise.allSettled(files.map((f) => unlink(f).catch(() => {})));
}
