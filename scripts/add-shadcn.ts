#!/usr/bin/env tsx
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ----------------------------
// CONFIG
// ----------------------------
const UI_PACKAGE_DIR = path.resolve(__dirname, "../packages/ui");
const COMPONENTS_DIR = path.join(UI_PACKAGE_DIR, "src/components");
const INDEX_FILE = path.join(UI_PACKAGE_DIR, "src/index.ts");

// ----------------------------
// Get component name from args
// ----------------------------
const component = process.argv[2];
if (!component) {
  console.error(
    "Please specify a component, e.g. pnpm tsx scripts/add-shadcn.ts accordion OR pnpm tsx scripts/add-shadcn.ts @tailark/mist-sign-up-1 apps/app"
  );
  process.exit(1);
}

// ----------------------------
// Ensure components.json exists
// ----------------------------
const COMPONENTS_JSON = path.join(UI_PACKAGE_DIR, "components.json");
if (!fs.existsSync(COMPONENTS_JSON)) {
  fs.writeFileSync(COMPONENTS_JSON, JSON.stringify({ components: [] }, null, 2));
  console.log("Created components.json in packages/ui");
}

// ----------------------------
// Run ShadCN CLI with --target
// ----------------------------
try {
  execSync(
    `pnpm dlx shadcn@latest add ${component} --target ${COMPONENTS_DIR}`,
    { stdio: "inherit", cwd: UI_PACKAGE_DIR }
  );
} catch (err) {
  console.error(
    `Failed to add component ${component}. Make sure Tailwind CSS is configured in packages/ui.`
  );
  process.exit(1);
}

// ----------------------------
// Update index.ts exports
// ----------------------------
if (!fs.existsSync(INDEX_FILE)) {
  fs.writeFileSync(INDEX_FILE, "");
}

let exportsContent = fs.readFileSync(INDEX_FILE, "utf-8");
const exportLine = `export { ${capitalize(component)} } from "./components/${capitalize(component)}";`;

if (!exportsContent.includes(exportLine)) {
  exportsContent += "\n" + exportLine + "\n";
  fs.writeFileSync(INDEX_FILE, exportsContent);
  console.log(`Exported ${capitalize(component)} in index.ts`);
}

// ----------------------------
// Helpers
// ----------------------------
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

console.log(`✅ Component "${capitalize(component)}" added successfully!`);
