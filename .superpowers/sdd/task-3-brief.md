### Task 3: PNG render + share helpers

**Files:**
- Create: `src/features/shareStats/lib/renderShareCardToPng.ts`
- Create: `src/features/shareStats/lib/sharePngFile.ts`
- Modify: `package.json` / lockfile via `pnpm add`

**Interfaces:**
- Consumes: `html-to-image`, Capacitor Share/Filesystem (same cancel detection as `downloadTextFile`)
- Produces:
  - `renderShareCardToPng(element: HTMLElement): Promise<Blob>`
  - `sharePngFile(filename: string, blob: Blob): Promise<"native-share" | "native-cancelled" | "web-share" | "browser-download">`

- [ ] **Step 1: Install dependency**

```bash
pnpm add html-to-image
```

- [ ] **Step 2: Render helper**

```ts
import { toBlob } from "html-to-image";

export const renderShareCardToPng = async (
  element: HTMLElement,
): Promise<Blob> => {
  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });
  if (!blob) {
    throw new Error("Не удалось создать изображение.");
  }
  return blob;
};
```

- [ ] **Step 3: Share helper**

Mirror `downloadTextFile` but for binary PNG:

- Native: write base64 to `Directory.Cache` via `Filesystem.writeFile`, then `Share.share({ title, url: uri, dialogTitle })`. Detect cancel tokens `cancel|canceled|cancelled`.
- Web: if `navigator.canShare?.({ files: [file] })`, `navigator.share({ files: [file], title: "Fit" })`; else create object URL + `<a download>`.

```ts
export type SharePngResult =
  | "native-share"
  | "native-cancelled"
  | "web-share"
  | "browser-download";

export const sharePngFile = async (
  filename: string,
  blob: Blob,
): Promise<SharePngResult> => { /* ... */ };
```

Convert blob → base64 for Capacitor Filesystem (FileReader or `arrayBuffer` + btoa chunk loop).

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/features/shareStats/lib/renderShareCardToPng.ts src/features/shareStats/lib/sharePngFile.ts
git commit -m "$(cat <<'EOF'
feat(shareStats): add PNG render and native/web share helpers

EOF
)"
```

---

