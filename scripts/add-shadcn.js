#!/usr/bin/env tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ----------------------------
// CONFIG
// ----------------------------
const UI_PACKAGE_DIR = path_1.default.resolve(__dirname, "../packages/ui");
const COMPONENTS_DIR = path_1.default.join(UI_PACKAGE_DIR, "src/components");
const INDEX_FILE = path_1.default.join(UI_PACKAGE_DIR, "src/index.ts");
// ----------------------------
// Get component name from args
// ----------------------------
const component = process.argv[2];
if (!component) {
    console.error("Please specify a component, e.g. pnpm tsx scripts/add-shadcn.ts accordion OR pnpm tsx scripts/add-shadcn.ts @tailark/mist-sign-up-1 apps/app");
    process.exit(1);
}
// ----------------------------
// Ensure components.json exists
// ----------------------------
const COMPONENTS_JSON = path_1.default.join(UI_PACKAGE_DIR, "components.json");
if (!fs_1.default.existsSync(COMPONENTS_JSON)) {
    fs_1.default.writeFileSync(COMPONENTS_JSON, JSON.stringify({ components: [] }, null, 2));
    console.log("Created components.json in packages/ui");
}
// ----------------------------
// Run ShadCN CLI with --target
// ----------------------------
try {
    (0, child_process_1.execSync)(`pnpm dlx shadcn@latest add ${component} --target ${COMPONENTS_DIR}`, { stdio: "inherit", cwd: UI_PACKAGE_DIR });
}
catch (err) {
    console.error(`Failed to add component ${component}. Make sure Tailwind CSS is configured in packages/ui.`);
    process.exit(1);
}
// ----------------------------
// Update index.ts exports
// ----------------------------
if (!fs_1.default.existsSync(INDEX_FILE)) {
    fs_1.default.writeFileSync(INDEX_FILE, "");
}
let exportsContent = fs_1.default.readFileSync(INDEX_FILE, "utf-8");
const exportLine = `export { ${capitalize(component)} } from "./components/${capitalize(component)}";`;
if (!exportsContent.includes(exportLine)) {
    exportsContent += "\n" + exportLine + "\n";
    fs_1.default.writeFileSync(INDEX_FILE, exportsContent);
    console.log(`Exported ${capitalize(component)} in index.ts`);
}
// ----------------------------
// Helpers
// ----------------------------
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
console.log(`✅ Component "${capitalize(component)}" added successfully!`);
