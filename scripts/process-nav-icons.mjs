import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", ".tmp-icons-extract");
const dest = path.join(__dirname, "..", "public", "icons");
const publicDir = path.join(__dirname, "..", "public");

fs.mkdirSync(dest, { recursive: true });

const normalizeSvg = (content) =>
  content
    .replace(/<rect width="125" height="125" fill="white"\/>/g, "")
    .replace(/<rect width="125" height="125" fill="white" \/>/g, "")
    .replace(/fill="black"/g, 'fill="currentColor"')
    .replace(
      /<g clip-path="url\(#[^)]+\)">([\s\S]*?)<\/g>\s*<defs>\s*<clipPath[^>]*>[\s\S]*?<\/clipPath>\s*<\/defs>/g,
      "$1",
    );

/** Соответствие экспорта Figma → экран: таймер, упражнения, аналитика, настройки, тело, меню; логотип — бицепс. */
const map = [
  ["Frame 3.svg", "nav-timer.svg"],
  ["Frame 2.svg", "nav-exercises.svg"],
  ["Frame 5.svg", "nav-analytics.svg"],
  ["Frame 7.svg", "nav-settings.svg"],
  ["Frame 4.svg", "nav-body-metrics.svg"],
  ["Frame 6.svg", "nav-menu.svg"],
  ["Frame 1.svg", "logo-mark.svg"],
];

for (const [srcName, outName] of map) {
  const raw = fs.readFileSync(path.join(root, srcName), "utf8");
  fs.writeFileSync(path.join(dest, outName), normalizeSvg(raw));
}

for (const n of [8, 9]) {
  const raw = fs.readFileSync(
    path.join(root, `Frame ${n}.svg`),
    "utf8",
  );
  fs.writeFileSync(path.join(dest, `extra-${n}.svg`), normalizeSvg(raw));
}

fs.copyFileSync(path.join(dest, "logo-mark.svg"), path.join(publicDir, "logo.svg"));
console.log("Icons written to public/icons and public/logo.svg");
