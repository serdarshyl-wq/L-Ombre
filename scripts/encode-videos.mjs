
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, statSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "_media-source");
const OUT_DIR = join(ROOT, "public", "videos");
const POSTER_DIR = join(OUT_DIR, "posters");

const DURATION = 3;

const CLIPS = [
  { out: "elixir", start: 50, src: "Elixier Perfume Commercial (Spec Ad).mp4" },
  { out: "tom-ford", start: 15, src: "Tom Ford - Fougere D'Argent (Spec Ad).mp4" },
  {
    out: "cadillac",
    start: 24,
    src: "Timeless   A Cinematic Cadillac SPEC Commercial - Shot on Alexa Mini + Sony FX3.mp4",
  },
  { out: "bmw", start: 13, src: "BMW M3   30 Second  Spec  Commercial.mp4" },
  { out: "weekday", start: 13, src: "WEEKDAY   Fashion Spec Commercial   Sony Fx6.mp4" },
  { out: "ysl", start: 11, src: "Fashion Spec Ad   Yves Saint Laurent.mp4" },

  { out: "nike", start: 6, src: "Nike - Spec Ad - Shape you Life.mp4" },
  { out: "oakley", start: 24, src: "Oakley - Enhance your Nature (spec ad).mp4" },
  { out: "sony", start: 9, src: "Spec commercial - SONY.mp4" },
  { out: "uber", start: 6, src: "UBER - Spec Commercial.mp4" },
];

const FILTER = "crop=ih*9/16:ih,scale=720:1280:flags=lanczos,setsar=1";

const ffmpeg = (args) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], {
    stdio: ["ignore", "inherit", "inherit"],
  });

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2);

const FULL = process.argv.includes("--full");
const LOOP = process.argv.includes("--loop");
const FORCE = process.argv.includes("--force");

const FULL_DIR = join(OUT_DIR, "full");
const LOOP_DIR = join(OUT_DIR, "loop");
const WIDE_DIR = join(POSTER_DIR, "wide");

mkdirSync(OUT_DIR, { recursive: true });
if (FULL) mkdirSync(FULL_DIR, { recursive: true });
else if (LOOP) mkdirSync(LOOP_DIR, { recursive: true });
else mkdirSync(WIDE_DIR, { recursive: true });

const done = (path) => !FORCE && existsSync(path) && statSync(path).size > 0;

for (const { out, src, start } of CLIPS) {
  const input = join(SRC_DIR, src);
  if (!existsSync(input)) {
    console.error(`! kaynak yok: ${src}`);
    continue;
  }

  if (LOOP) {
    const loop = join(LOOP_DIR, `${out}.webm`);
    if (done(loop)) {
      console.log(`loop/${out}.webm  atlandı`);
      continue;
    }
    ffmpeg([
      "-ss", String(start),
      "-i", input,
      "-t", String(DURATION),

      "-vf",
      "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=1440:810:flags=lanczos,setsar=1",
      "-c:v", "libvpx-vp9",
      "-crf", "31",
      "-b:v", "0",
      "-row-mt", "1",
      "-cpu-used", "2",
      "-deadline", "good",
      "-g", "48",
      "-pix_fmt", "yuv420p",
      "-an",
      loop,
    ]);
    console.log(`loop/${out}.webm  ${mb(loop)} MB`);
    continue;
  }

  if (FULL) {
    const full = join(FULL_DIR, `${out}.webm`);
    if (done(full)) {
      console.log(`full/${out}.webm  atlandı`);
      continue;
    }

    const video = [
      "-c:v", "libvpx-vp9",
      "-crf", "38",
      "-b:v", "0",
      "-row-mt", "1",
      "-cpu-used", "1",
      "-deadline", "good",
      "-auto-alt-ref", "1",
      "-lag-in-frames", "25",
      "-tile-columns", "2",
      "-pix_fmt", "yuv420p",
    ];
    const passlog = join(FULL_DIR, `.${out}`);

    ffmpeg([
      "-i", input,
      "-vf", "scale=1920:-2:flags=lanczos",
      ...video,
      "-an",
      "-pass", "1",
      "-passlogfile", passlog,
      "-f", "webm",
      process.platform === "win32" ? "NUL" : "/dev/null",
    ]);

    ffmpeg([
      "-i", input,
      "-vf", "scale=1920:-2:flags=lanczos",
      ...video,
      "-c:a", "libopus",
      "-b:a", "96k",
      "-pass", "2",
      "-passlogfile", passlog,
      full,
    ]);

    rmSync(`${passlog}-0.log`, { force: true });

    console.log(`full/${out}.webm  ${mb(full)} MB`);
    continue;
  }

  const webm = join(OUT_DIR, `${out}.webm`);
  const poster = join(POSTER_DIR, `${out}.jpg`);

  if (done(webm)) {
    console.log(`${out}.webm  atlandı`);
    continue;
  }

  ffmpeg([
    "-ss", String(start),
    "-i", input,
    "-t", String(DURATION),
    "-vf", FILTER,
    "-c:v", "libvpx-vp9",
    "-crf", "28",
    "-b:v", "0",
    "-row-mt", "1",
    "-cpu-used", "2",
    "-deadline", "good",
    "-g", "48",
    "-pix_fmt", "yuv420p",
    "-an",
    webm,
  ]);

  ffmpeg([
    "-ss", String(start),
    "-i", input,
    "-frames:v", "1",
    "-vf", FILTER,
    "-q:v", "4",
    poster,
  ]);

  const wide = join(WIDE_DIR, `${out}.jpg`);
  ffmpeg([
    "-ss", String(start),
    "-i", input,
    "-frames:v", "1",
    "-vf", "scale=1920:-2:flags=lanczos",
    "-q:v", "4",
    wide,
  ]);

  console.log(
    `${out}.webm  ${mb(webm)} MB   +poster ${mb(poster)} / wide ${mb(wide)} MB`
  );
}
