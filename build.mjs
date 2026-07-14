// Static "build": there is no bundler — just copy the site into dist/
// so hosts that require a build command + output directory are satisfied.
import { rmSync, mkdirSync, cpSync } from "node:fs";

const OUT = "dist";
const ITEMS = ["index.html", "dark.html", "dark-star.html", "css", "js", "assets"];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const item of ITEMS) {
  cpSync(item, `${OUT}/${item}`, { recursive: true });
}
console.log(`Static site copied to ${OUT}/ (${ITEMS.length} items).`);
