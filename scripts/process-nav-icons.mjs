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

/** Соответствие экспорта Figma → имена файлов по содержанию иконки. */
const map = [
  ["Frame 3.svg", "icon-muscles-front.svg"],
  ["Frame 2.svg", "icon-kettlebell.svg"],
  ["Frame 5.svg", "icon-area-chart.svg"],
  ["Frame 7.svg", "icon-abs-core.svg"],
  ["Frame 4.svg", "icon-body-measurements.svg"],
  ["Frame 6.svg", "icon-leg.svg"],
  ["Frame 1.svg", "icon-biceps.svg"],
];

for (const [srcName, outName] of map) {
  const raw = fs.readFileSync(path.join(root, srcName), "utf8");
  fs.writeFileSync(path.join(dest, outName), normalizeSvg(raw));
}

const extraMap = [
  ["Frame 8.svg", "icon-mobility-arms-up.svg"],
  ["Frame 9.svg", "icon-shoulders.svg"],
];

for (const [srcName, outName] of extraMap) {
  const raw = fs.readFileSync(path.join(root, srcName), "utf8");
  fs.writeFileSync(path.join(dest, outName), normalizeSvg(raw));
}

fs.copyFileSync(
  path.join(dest, "icon-biceps.svg"),
  path.join(publicDir, "logo.svg"),
);
console.log("Icons written to public/icons and public/logo.svg");
