#!/usr/bin/env tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// ----------------------------
// CONFIG
// ----------------------------
const GITIGNORE_PATH = path_1.default.resolve(process.cwd(), ".gitignore");
const BRANCH = "master";
const REMOTE = "origin";
// ----------------------------
// Helper functions
// ----------------------------
function exec(command, options) {
    try {
        return (0, child_process_1.execSync)(command, {
            stdio: options?.stdio || "pipe",
            cwd: options?.cwd || process.cwd(),
            encoding: "utf-8"
        });
    }
    catch (error) {
        if (options?.stdio === "inherit") {
            throw error;
        }
        return error.stdout || "";
    }
}
function getGitStatus() {
    const status = exec("git status --porcelain -b");
    // Match: ## branch...remote [ahead X] or ## branch [ahead X]
    const branchMatch = status.match(/## ([^\s.]+)(?:\.\.\.[^\s]+)?(?:\s+\[(.+?)\])?/);
    const branch = branchMatch?.[1] || "unknown";
    const tracking = branchMatch?.[2] || "";
    const aheadMatch = tracking.match(/ahead (\d+)/);
    const behindMatch = tracking.match(/behind (\d+)/);
    const ahead = aheadMatch ? parseInt(aheadMatch[1], 10) : 0;
    const behind = behindMatch ? parseInt(behindMatch[1], 10) : 0;
    const clean = !status.split("\n").some((line) => line.trim() && !line.startsWith("##"));
    return { branch, ahead, behind, clean };
}
function checkNodeModulesTracked() {
    const tracked = exec("git ls-files | grep node_modules");
    return tracked.trim().length > 0;
}
function checkGitignore() {
    if (!(0, fs_1.existsSync)(GITIGNORE_PATH)) {
        return false;
    }
    const content = (0, fs_1.readFileSync)(GITIGNORE_PATH, "utf-8");
    return content.includes("node_modules");
}
// ----------------------------
// Main workflow functions
// ----------------------------
function step1_CommitNodeModulesRemoval() {
    console.log("\n📦 Step 1: Checking for tracked node_modules...");
    if (!checkNodeModulesTracked()) {
        console.log("✅ No node_modules are tracked in git.");
        return false;
    }
    if (!checkGitignore()) {
        console.error("❌ node_modules is not in .gitignore. Please add it first.");
        return false;
    }
    console.log("⚠️  Found tracked node_modules. Removing from git...");
    exec("git rm -r --cached node_modules apps/*/node_modules packages/*/node_modules 2>/dev/null || true", { stdio: "inherit" });
    exec("git add -A", { stdio: "inherit" });
    exec(`git commit -m "Remove node_modules from git tracking"`, { stdio: "inherit" });
    console.log("✅ Committed node_modules removal.");
    return true;
}
function step2_PullAndMerge() {
    console.log("\n🔄 Step 2: Pulling and merging remote changes...");
    try {
        exec(`git pull ${REMOTE} ${BRANCH} --no-rebase`, { stdio: "inherit" });
        console.log("✅ Successfully pulled and merged.");
        return true;
    }
    catch (error) {
        console.error("❌ Merge failed. Please resolve conflicts manually:");
        console.error("   1. Resolve conflicts in the files");
        console.error("   2. Run: git add .");
        console.error("   3. Run: git commit");
        console.error("   4. Then run this script again with --push flag");
        return false;
    }
}
function step3_Push() {
    console.log("\n🚀 Step 3: Pushing to remote...");
    try {
        exec(`git push ${REMOTE} ${BRANCH}`, { stdio: "inherit" });
        console.log("✅ Successfully pushed to remote.");
        return true;
    }
    catch (error) {
        console.error("❌ Push failed. Check your permissions and network connection.");
        return false;
    }
}
function verify() {
    console.log("\n🔍 Verification:");
    const status = getGitStatus();
    console.log(`   Branch: ${status.branch}`);
    console.log(`   Ahead: ${status.ahead}`);
    console.log(`   Behind: ${status.behind}`);
    console.log(`   Working tree: ${status.clean ? "clean" : "dirty"}`);
    if (status.ahead === 0 && status.behind === 0 && status.clean) {
        console.log("\n✅ All done! Branch is up to date with remote.");
    }
}
// ----------------------------
// CLI
// ----------------------------
const args = process.argv.slice(2);
const command = args[0];
console.log("🔧 Git Sync Script for pacepard");
console.log("================================");
if (command === "--status" || command === "-s") {
    const status = getGitStatus();
    console.log(`\nCurrent Status:`);
    console.log(`  Branch: ${status.branch}`);
    console.log(`  Ahead of remote: ${status.ahead} commits`);
    console.log(`  Behind remote: ${status.behind} commits`);
    console.log(`  Working tree: ${status.clean ? "clean ✅" : "dirty ⚠️"}`);
    if (checkNodeModulesTracked()) {
        console.log(`  ⚠️  node_modules are tracked in git`);
    }
    else {
        console.log(`  ✅ No node_modules tracked`);
    }
    process.exit(0);
}
if (command === "--push" || command === "-p") {
    if (step3_Push()) {
        verify();
    }
    process.exit(0);
}
if (command === "--full" || command === "-f") {
    step1_CommitNodeModulesRemoval();
    if (step2_PullAndMerge()) {
        step3_Push();
    }
    verify();
    process.exit(0);
}
// Default: interactive workflow
console.log("\nRunning full sync workflow...\n");
const status = getGitStatus();
console.log(`Current branch: ${status.branch}`);
console.log(`Ahead: ${status.ahead}, Behind: ${status.behind}\n`);
if (status.behind > 0) {
    const removed = step1_CommitNodeModulesRemoval();
    if (step2_PullAndMerge()) {
        if (status.ahead > 0 || removed) {
            step3_Push();
        }
        else {
            console.log("\n✅ Already up to date. Nothing to push.");
        }
    }
}
else if (status.ahead > 0) {
    console.log("✅ Local is ahead. Pushing...");
    step3_Push();
}
else {
    console.log("✅ Already in sync with remote.");
}
verify();
