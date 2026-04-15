#!/usr/bin/env node
/**
 * PixelTech Blog — Interactive Setup Wizard
 *
 * Usage: npm run setup
 *
 * Walks you through configuring .env, initializing the database,
 * seeding demo content, and launching the dev server — all with
 * zero prior knowledge required.
 */

import readline from "node:readline";
import { randomBytes } from "node:crypto";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENV_PATH = resolve(ROOT, ".env");

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

function printBanner() {
  const line = "═".repeat(60);
  console.log("");
  console.log(C.magenta + line + C.reset);
  console.log(C.bold + C.magenta + "  PixelTech Blog — 部署向导 Setup Wizard" + C.reset);
  console.log(C.gray + "  全程 5 分钟，一步步跟着提示走就行" + C.reset);
  console.log(C.magenta + line + C.reset);
  console.log("");
}

function section(title, desc) {
  console.log("");
  console.log(C.cyan + C.bold + "▸ " + title + C.reset);
  if (desc) console.log(C.gray + "  " + desc + C.reset);
  console.log("");
}

function ok(msg) {
  console.log(C.green + "  ✓ " + C.reset + msg);
}

function warn(msg) {
  console.log(C.yellow + "  ! " + C.reset + msg);
}

function err(msg) {
  console.log(C.red + "  ✗ " + C.reset + msg);
}

async function askYesNo(question, defaultYes = true) {
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  while (true) {
    const raw = (await ask(`  ${question} ${C.gray}${hint}${C.reset} `)).toLowerCase();
    if (raw === "") return defaultYes;
    if (["y", "yes", "是", "好"].includes(raw)) return true;
    if (["n", "no", "否", "不"].includes(raw)) return false;
    warn("请输入 y 或 n");
  }
}

async function askUntilValid(prompt, validator, opts = {}) {
  while (true) {
    const hint = opts.defaultValue ? C.gray + ` (默认: ${opts.defaultValue})` + C.reset : "";
    let raw = await ask(`  ${prompt}${hint}\n  > `);
    if (raw === "" && opts.defaultValue) raw = opts.defaultValue;
    const result = validator(raw);
    if (result.ok) return result.value;
    err(result.error);
  }
}

function validateDatabaseUrl(raw) {
  if (!raw) return { ok: false, error: "不能为空" };
  if (!/^postgres(ql)?:\/\//.test(raw)) {
    return { ok: false, error: "应该以 postgres:// 或 postgresql:// 开头，检查一下有没有复制完整" };
  }
  if (!raw.includes("@") || !raw.includes("/")) {
    return { ok: false, error: "连接串格式不对，应该长这样: postgresql://user:password@host/dbname" };
  }
  return { ok: true, value: raw };
}

function validateEmail(raw) {
  if (!raw) return { ok: false, error: "不能为空" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return { ok: false, error: "邮箱格式不对" };
  }
  return { ok: true, value: raw };
}

function validatePassword(raw) {
  if (!raw) return { ok: false, error: "不能为空" };
  if (raw.length < 8) return { ok: false, error: "密码至少 8 位" };
  return { ok: true, value: raw };
}

function validateUrl(raw) {
  if (!raw) return { ok: false, error: "不能为空" };
  if (!/^https?:\/\//.test(raw)) {
    return { ok: false, error: "应该以 http:// 或 https:// 开头" };
  }
  return { ok: true, value: raw.replace(/\/+$/, "") };
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    console.log(C.gray + `  $ ${command} ${args.join(" ")}` + C.reset);
    const child = spawn(command, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => resolve(code ?? 0));
    child.on("error", () => resolve(1));
  });
}

async function main() {
  printBanner();

  // ── Step 0: existing .env check ────────────────────────────────
  let keepExisting = {};
  if (existsSync(ENV_PATH)) {
    warn(".env 已经存在。");
    const overwrite = await askYesNo("要覆盖现有 .env 吗？（选 n 则在现有基础上补全缺失字段）", false);
    if (!overwrite) {
      const text = readFileSync(ENV_PATH, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^([A-Z_]+)=\"?([^\"]*)\"?\s*$/);
        if (m) keepExisting[m[1]] = m[2];
      }
      ok(`保留 ${Object.keys(keepExisting).length} 个已有字段，下面只问缺失的`);
    }
  }

  // ── Step 1: DATABASE_URL ────────────────────────────────────────
  section("第 1 步：Postgres 数据库连接串", "免费额度够用，推荐 Neon (https://neon.tech)");
  let databaseUrl = keepExisting.DATABASE_URL;
  if (!databaseUrl) {
    console.log("  " + C.bold + "如果还没有数据库：" + C.reset);
    console.log(C.gray + "  1) 打开 https://neon.tech，用 GitHub 账号登录");
    console.log("  2) Create Project → 名字随便填 → Create");
    console.log("  3) 在 Dashboard 找到 \"Connection string\" → 点复制");
    console.log("  4) 粘贴到下面（以 postgresql:// 开头）" + C.reset);
    console.log("");
    databaseUrl = await askUntilValid("粘贴 DATABASE_URL:", validateDatabaseUrl);
    ok("数据库连接串已记录");
  } else {
    ok("沿用已有 DATABASE_URL");
  }

  // ── Step 2: AUTH_SECRET (auto-generated) ────────────────────────
  section("第 2 步：会话加密密钥", "自动生成一串随机字符，你不用管");
  let authSecret = keepExisting.AUTH_SECRET;
  if (!authSecret) {
    authSecret = randomBytes(32).toString("base64");
    ok("已自动生成 AUTH_SECRET（长度 " + authSecret.length + "）");
  } else {
    ok("沿用已有 AUTH_SECRET");
  }

  // ── Step 3: AUTH_URL ────────────────────────────────────────────
  section("第 3 步：应用访问地址", "本地开发用 http://localhost:3000；部署后回来改成真实域名");
  let authUrl = keepExisting.AUTH_URL;
  if (!authUrl) {
    authUrl = await askUntilValid("AUTH_URL:", validateUrl, { defaultValue: "http://localhost:3000" });
    ok("访问地址已记录: " + authUrl);
  } else {
    ok("沿用已有 AUTH_URL: " + authUrl);
  }

  // ── Step 4: Admin account ───────────────────────────────────────
  section("第 4 步：管理员账号", "这是你登录后台 /admin 的唯一凭证，记在安全的地方");
  let adminEmail = keepExisting.ADMIN_EMAIL;
  if (!adminEmail) {
    adminEmail = await askUntilValid("管理员邮箱:", validateEmail, { defaultValue: "admin@pixeltech.dev" });
  } else {
    ok("沿用已有 ADMIN_EMAIL: " + adminEmail);
  }
  let adminPassword = keepExisting.ADMIN_PASSWORD;
  if (!adminPassword) {
    warn("注意：密码会明文显示在终端里，确认周围没人偷看");
    adminPassword = await askUntilValid("管理员密码 (至少 8 位):", validatePassword);
    ok("管理员账号已记录");
  } else {
    ok("沿用已有 ADMIN_PASSWORD");
  }

  // ── Write .env ──────────────────────────────────────────────────
  section("写入 .env 文件", ENV_PATH);
  const envContent = [
    "# Generated by scripts/setup.mjs",
    `DATABASE_URL="${databaseUrl}"`,
    `AUTH_SECRET="${authSecret}"`,
    `AUTH_URL="${authUrl}"`,
    `ADMIN_EMAIL="${adminEmail}"`,
    `ADMIN_PASSWORD="${adminPassword}"`,
    "",
  ].join("\n");
  writeFileSync(ENV_PATH, envContent, { encoding: "utf8", mode: 0o600 });
  ok(".env 已写入（权限 600，只有你能读）");

  // ── Step 5: db push ─────────────────────────────────────────────
  section("第 5 步：初始化数据库", "在 Neon 里建 User / Post / Tag / Comment 等所有表");
  if (await askYesNo("现在跑 prisma db push 建表？", true)) {
    const code = await runCommand("npx", ["prisma", "db", "push"]);
    if (code === 0) ok("数据库表结构已就绪");
    else {
      err("prisma db push 失败，退出码 " + code);
      warn("常见原因：DATABASE_URL 填错、Neon 数据库被休眠（登录 Neon 控制台唤醒一下）、网络连不上");
      if (!(await askYesNo("继续往下跑吗？", false))) process.exit(1);
    }
  }

  // ── Step 6: seed ────────────────────────────────────────────────
  section("第 6 步：灌入演示数据", "建管理员账号 + 8 篇示例文章 + 10 个标签 + 演示用户");
  if (await askYesNo("现在跑 seed 灌数据？", true)) {
    const code = await runCommand("npm", ["run", "db:seed"]);
    if (code === 0) ok("演示数据已就绪");
    else {
      err("seed 失败，退出码 " + code);
      if (!(await askYesNo("继续吗？", false))) process.exit(1);
    }
  }

  // ── Step 7: dev ─────────────────────────────────────────────────
  section("第 7 步：启动开发服务器", "在浏览器打开 http://localhost:3000 预览");
  console.log("  登录信息：");
  console.log("    邮箱: " + C.bold + adminEmail + C.reset);
  console.log("    密码: " + C.bold + adminPassword + C.reset);
  console.log("");

  const launch = await askYesNo("现在启动 npm run dev？", true);
  rl.close();

  if (launch) {
    console.log("");
    console.log(C.magenta + "  启动中... 按 Ctrl+C 停止" + C.reset);
    console.log("");
    await runCommand("npm", ["run", "dev"]);
  } else {
    console.log("");
    ok("配置完成 🎉 随时运行 " + C.bold + "npm run dev" + C.reset + " 启动");
    console.log("");
    console.log(C.gray + "  下一步部署到 Vercel：看 DEPLOYMENT.md 第 3 节" + C.reset);
    console.log("");
  }
}

main().catch((e) => {
  err("向导出错: " + e.message);
  process.exit(1);
});
