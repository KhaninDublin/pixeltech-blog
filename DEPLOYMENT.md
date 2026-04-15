# PixelTech 博客 — 完整部署指南（中文）

> 这份文档是给**第一次部署网站**的同学写的，每一步都带截图位置说明和复制粘贴命令。
> 全程大约 **20–30 分钟**，零费用（GitHub + Vercel + Neon 免费额度完全够用）。
>
> 最终你会得到一个可以公开访问的网址，例如 `https://pixeltech-blog.vercel.app`，自己就是管理员。

---

## 目录

1. [前置准备](#1-前置准备)
2. [本地先跑通（强烈建议）](#2-本地先跑通强烈建议)
3. [推代码到 GitHub](#3-推代码到-github)
4. [在 Vercel 创建项目](#4-在-vercel-创建项目)
5. [挂一个 Postgres 数据库（Neon）](#5-挂一个-postgres-数据库neon)
6. [配置环境变量](#6-配置环境变量)
7. [首次部署](#7-首次部署)
8. [一次性灌入种子数据](#8-一次性灌入种子数据)
9. [验证上线](#9-验证上线)
10. [常见错误与排查](#10-常见错误与排查)
11. [上交前的检查清单](#11-上交前的检查清单)

---

## 1. 前置准备

你需要注册好以下三个账号（全部免费）：

| 服务 | 用途 | 注册链接 |
|---|---|---|
| **GitHub** | 托管代码 | <https://github.com/signup> |
| **Vercel** | 托管网站 | <https://vercel.com/signup>（建议直接用 GitHub 账号登录） |
| **Neon** | Postgres 数据库（也可以在 Vercel Marketplace 里一键创建，不用单独注册） | <https://neon.tech> |

本地电脑需要装：

- **Node.js 20 或更高版本** — <https://nodejs.org>（选 LTS 版本）
- **Git** — 一般 Mac/Linux 自带，Windows 装 <https://git-scm.com/download/win>
- **一个代码编辑器** — 推荐 VS Code <https://code.visualstudio.com>

验证安装：打开终端（Mac 的 "Terminal" 或 Windows 的 PowerShell），输入：

```bash
node --version   # 应该输出 v20.x 或更高
npm --version    # 应该输出 10.x 或更高
git --version    # 应该输出 git version 2.x
```

---

## 2. 本地先跑通（强烈建议）

在推到 Vercel 之前，先在自己电脑上跑一遍，确认一切正常。

### 2.1 进入项目目录

```bash
cd ~/Desktop/tgj4m_work/pixeltech-blog
```

> Windows 用户请替换成自己解压/保存的路径。

### 2.2 安装依赖

```bash
npm install
```

等 1–2 分钟，会在项目里生成一个 `node_modules` 文件夹。

> 如果报 `ERESOLVE` 依赖冲突错误：检查项目根目录有没有 `.npmrc` 文件（内容是 `legacy-peer-deps=true`）。Mac 的 Finder 默认隐藏点开头的文件，按 `Cmd+Shift+.` 可以看到。没有的话手动创建一个即可。

---

### 2.3 ⚡ 一键配置向导（强烈推荐）

跑一条命令，全程交互式问答，自动帮你：

- 生成 `AUTH_SECRET`（不用自己敲随机数）
- 写 `.env` 文件（不用手动编辑隐藏文件）
- 初始化数据库（`prisma db push`）
- 灌入演示数据（`db:seed`）
- 启动开发服务器（`npm run dev`）

```bash
npm run setup
```

向导会一步步问你：

1. **数据库连接串** — 屏幕上会给你打开 Neon 的指引，复制粘贴即可
2. **访问地址** — 默认 `http://localhost:3000`，回车即可
3. **管理员邮箱和密码** — 自己起

全部填完后它会自动跑后面所有步骤，大概 2 分钟你就能看到网站了。

> **如果 `npm run setup` 没问题，下面 2.4 / 2.5 / 2.6 可以全部跳过，直接看 2.7 测试功能。**

---

### 2.4 （手动方式，可选）配置环境变量

如果你不想用向导，也可以自己来：

```bash
cp .env.example .env
```

然后用编辑器打开 `.env`，填好这四个值：

```env
# 数据库连接串。本地开发最简单的办法是去 Neon 免费开一个：
# 1. 打开 https://neon.tech 登录
# 2. Create Project → 名字随便填
# 3. 在 Dashboard 复制 "Connection string"（以 postgresql:// 开头的那串）
DATABASE_URL="postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# 用来加密会话 cookie 的密钥。随便敲一串长一点的随机字符就行，或者运行：
#   openssl rand -base64 32
AUTH_SECRET="随便一长串随机字符至少32位"

# 本地开发网址
AUTH_URL="http://localhost:3000"

# 管理员账号（你自己的）。后面登录就用这个邮箱和密码。
ADMIN_EMAIL="admin@pixeltech.dev"
ADMIN_PASSWORD="自己起一个强密码"
```

### 2.5 初始化数据库

```bash
npx prisma db push
```

这一步会根据 `prisma/schema.prisma` 在 Neon 数据库里建好所有表（User、Post、Comment 等）。

看到 `Your database is now in sync with your Prisma schema.` 就是成功了。

### 2.6 灌入演示数据 + 启动

```bash
npm run db:seed
npm run dev
```

`db:seed` 会自动创建：

- 1 个管理员（就是你 `.env` 里填的那个邮箱）
- 3 位作者：`ada@pixeltech.dev`、`linus@pixeltech.dev`、`grace@pixeltech.dev`（密码都是 `password123`）
- 2 个普通读者
- 10 个技术标签
- 8 篇长文章（带点赞、评论、收藏）

### 2.7 测试功能

看到 `Ready in xxx ms` 之后，打开浏览器访问 <http://localhost:3000>。

**试一下：**

- 首页能看到 8 篇文章
- 右上角点 **Sign in**，用管理员邮箱登录
- 登录后右上角头像菜单里会多出 **Admin** 入口 → 可以看到后台管理面板
- 点任意文章，能看到内容渲染、能点赞、能评论
- 去 `/write` 可以写新文章

一切正常就按 `Ctrl+C` 停掉服务，准备往 Vercel 推。

---

## 3. 推代码到 GitHub

### 3.1 在 GitHub 上建一个空仓库

1. 打开 <https://github.com/new>
2. **Repository name**：填 `pixeltech-blog`
3. **Public 或 Private 都行**（Vercel 免费版两种都支持）
4. **不要勾** "Add a README file"、"Add .gitignore"、"Add a license" — 我们项目里已经有了
5. 点 **Create repository**

### 3.2 在本地初始化 git 并推送

回到项目目录（如果还没在的话）：

```bash
cd /Users/martin/Downloads/tgj4m_work/pixeltech-blog
```

然后：

```bash
git init
git add .
git commit -m "Initial commit: PixelTech blog"
git branch -M main
git remote add origin https://github.com/你的用户名/pixeltech-blog.git
git push -u origin main
```

> 把 `你的用户名` 换成你真实的 GitHub 用户名。第一次 push 会弹出登录；推荐装 GitHub CLI (`brew install gh` / `winget install GitHub.cli`) 然后 `gh auth login` 一次搞定。

刷新 GitHub 仓库页面，应该能看到所有代码已经上去了。

> ⚠️ **检查一下 `.env` 文件没被推上去** — 项目里的 `.gitignore` 已经配置过了，但你可以去 GitHub 仓库确认一下，没看到 `.env` 就对了（`.env.example` 是可以看到的，那是模板）。

---

## 4. 在 Vercel 创建项目

1. 打开 <https://vercel.com/new>
2. 第一次用的话，会让你 **Import Git Repository** — 点 **Continue with GitHub** 授权
3. 授权完成后，在列表里找到 `pixeltech-blog`，点 **Import**
4. 进入配置页：
   - **Framework Preset**：应该自动识别为 **Next.js**（不用动）
   - **Root Directory**：保持默认（`./`）
   - **Build Command / Output Directory / Install Command**：全部保持默认（项目 `package.json` 里已经配好了）
5. **先别点 Deploy！** 还要配数据库和环境变量。展开下方 **Environment Variables** 区域，但先不填，我们下一步去搞数据库。

> 保留当前标签页不要关，我们等会还要回来。

---

## 5. 挂一个 Postgres 数据库（Neon）

Vercel 提供了 **Marketplace 一键开数据库**，最省心。

### 5.1 在 Vercel 项目里开数据库

1. 在当前 Vercel 配置页面，不要关，**另开一个标签页**进入你刚刚创建的 Vercel Dashboard — <https://vercel.com/dashboard>
2. 如果项目还没创建，这里会看不到。那就先回到第 4 步配置页，随便先点一下 Deploy（会失败，没关系），然后进入项目。
3. 进项目后，顶部导航点 **Storage** → **Create Database** → 选 **Neon** (Serverless Postgres)
4. 地区选离你近的（比如 `US East` 或 `Asia Pacific`）
5. 点 **Create** — 大约 10 秒完成
6. 创建完成后，Vercel 会**自动**把 `DATABASE_URL` 注入到你项目的环境变量里 — 爽点就在这

> 如果你已经在第 2 步用 Neon 建过数据库了，也可以不走 Marketplace，直接去 Neon 复制那个连接串，在下一步手动粘贴到 `DATABASE_URL` 里。但用 Marketplace 更简单。

---

## 6. 配置环境变量

回到 Vercel 项目 → **Settings** → **Environment Variables**。

`DATABASE_URL` 已经被 Neon 自动写进去了（如果你走的是 Marketplace）。你还要手动加另外三个：

| Name | Value | 勾选环境 |
|---|---|---|
| `AUTH_SECRET` | 运行 `openssl rand -base64 32` 生成一串；或者随便敲 40 个字符的随机字符串 | Production / Preview / Development 全选 |
| `AUTH_URL` | 暂时填 `https://pixeltech-blog.vercel.app`（具体网址在部署成功后会显示，到时候回来改也行） | 全选 |
| `ADMIN_EMAIL` | 你的管理员邮箱，例如 `admin@pixeltech.dev` | 全选 |
| `ADMIN_PASSWORD` | 管理员登录密码，自己起一个强密码，至少 12 位 | 全选 |

> **重要**：`ADMIN_PASSWORD` 记在安全的地方，这是你上线后唯一的管理员登录凭证。

加完之后保存。

---

## 7. 首次部署

1. 回到 Vercel 项目首页 → 顶部 **Deployments** 标签
2. 右上角点最新一次部署 → **Redeploy**（或者如果是全新项目没部署过，回到 Import 页点 **Deploy**）
3. 等 2–4 分钟。构建过程会自动：
   - 安装依赖
   - 运行 `prisma generate` 生成数据库客户端
   - 运行 `prisma db push --accept-data-loss` 在 Neon 里建表（第一次会建，之后改 schema 才会改）
   - `next build` 构建前端

**看到绿色的 Ready 就说明部署成功了。** 页面右上角会给你一个 `https://xxx.vercel.app` 的域名。

如果失败了（红色 Error），翻到本文档第 10 节 [常见错误与排查](#10-常见错误与排查)。

---

## 8. 一次性灌入种子数据

**重要**：种子脚本 `npm run db:seed` 不会在 Vercel 构建时自动跑（为了避免每次部署都重置数据）。你需要**从本地电脑**手动跑一次，让数据库里有初始的管理员账号 + 演示内容。

### 8.1 拿到生产数据库的连接串

1. Vercel 项目 → **Storage** → 点你刚创建的 Neon 数据库
2. 往下翻找 **Connection String** → 点 **Copy**（以 `postgresql://` 开头）

### 8.2 在本地跑种子脚本

回到项目目录，执行（**一整条命令**，不要换行）：

```bash
DATABASE_URL="把刚才复制的Neon连接串粘这里" ADMIN_EMAIL="你在Vercel里填的管理员邮箱" ADMIN_PASSWORD="你在Vercel里填的管理员密码" npm run db:seed
```

**Windows PowerShell 用户**请用这个写法：

```powershell
$env:DATABASE_URL="连接串"; $env:ADMIN_EMAIL="邮箱"; $env:ADMIN_PASSWORD="密码"; npm run db:seed
```

看到 `✅ Seed complete.` 就好了。这步只做一次。

> 如果你不想要演示文章，跳过这步也行 — 但至少要在生产库里有管理员账号，否则登不进后台。最简单的还是跑一次 seed，然后到后台把不喜欢的演示文章删掉。

---

## 9. 验证上线

打开你的 Vercel 域名，比如 `https://pixeltech-blog.vercel.app`：

- [ ] 首页显示 8 篇演示文章 + featured post
- [ ] 右上角 **Sign in** → 用 `ADMIN_EMAIL` + `ADMIN_PASSWORD` 能登录
- [ ] 登录后右上角头像菜单出现 **Admin**
- [ ] 进入 `/admin`，4 个 KPI 卡片有数字
- [ ] `/admin/users` 能看到用户列表、能改角色
- [ ] `/admin/posts` 能 Feature / Unfeature 文章
- [ ] `/admin/tags` 能新建标签
- [ ] 点任意文章 → 能点赞、能评论
- [ ] 去 `/write` → 写一篇新文章、点 Publish → 在首页能看到
- [ ] 退出登录 → 访问 `/admin` 会被跳到 `/login`（说明中间件生效）

全打勾就完美上线了 🎉

---

## 10. 常见错误与排查

### ❌ 构建报错 `Environment variable not found: DATABASE_URL`

**原因**：Vercel 里没配 `DATABASE_URL`，或者没勾对环境（Production）。
**解决**：Settings → Environment Variables，确认 `DATABASE_URL` 存在且勾了 Production，然后 Redeploy。

### ❌ 构建报错 `prisma: command not found` / `@prisma/client did not initialize yet`

**原因**：`postinstall` 没跑成功。
**解决**：确认 `package.json` 里有 `"postinstall": "prisma generate"`（本项目已经有了）。如果还不行，Redeploy 一次。

### ❌ 访问网站返回 500 / `PrismaClientInitializationError`

**原因**：一般是数据库表没建。
**解决**：确认构建日志里有 `Your database is now in sync` 这一句。如果没有，说明 `prisma db push` 没执行；检查 `package.json` 里 `build` 字段是否为：
```
"build": "prisma generate && prisma db push --skip-generate --accept-data-loss && next build"
```

### ❌ 登录后立刻又被登出 / `JWTSessionError`

**原因**：`AUTH_SECRET` 没配，或者不同环境（Preview vs Production）配了不同的值。
**解决**：Settings → Environment Variables，给 `AUTH_SECRET` 三个环境都填**同一个值**，然后 Redeploy。

### ❌ 登录时报 `Invalid credentials`，但邮箱密码明明对

**原因**：生产数据库里根本还没有这个管理员账号 —— 你跳过了第 8 步 seed。
**解决**：按第 8 步跑一次 `npm run db:seed`，或者访问 `/register` 用同一个邮箱注册一个账号，然后去 Neon 控制台手动把 `role` 字段改成 `ADMIN`。

### ❌ `AUTH_URL` 写错了，导致 OAuth 回调失败 / Cookie 不生效

**解决**：Settings → Environment Variables，把 `AUTH_URL` 改成部署成功后 Vercel 给你的真实域名（**要带 `https://`，末尾不要带斜杠**），Redeploy。

### ❌ Push 代码到 GitHub 卡住 / 401

**解决**：装 GitHub CLI，`gh auth login` 按提示走一次；或者用 Personal Access Token 替代密码 — <https://github.com/settings/tokens>。

---

## 11. 上交前的检查清单

交作业之前最后过一遍：

- [ ] 网站能正常访问，URL 能分享给别人打开
- [ ] 至少有 1 个 ADMIN 账号、几篇已发布的文章
- [ ] 试着用无痕/隐身模式访问网站，确认未登录状态功能也正常（能看文章，但不能点赞 / 评论 / 进 /admin）
- [ ] README 里的功能点（注册、登录、写作、点赞、评论、关注、书签、管理后台）每一项你都试过一次能 work
- [ ] 把 Vercel 上的 URL 和管理员账号（老师评分用）一起交给老师
- [ ] DOCX 作业部分已经填好（对应文件在 `/Users/martin/Downloads/tgj4m_work/TGJ4M_U4_Summative_COMPLETED.docx`）

---

## 附录 A：怎么再写一篇博客文章？

1. 登录你的账号（任何 role 都可以写）
2. 顶部点 **Write**
3. 左边写 Markdown 源码，右边 Preview 实时预览
4. 填好标题、简介、封面图 URL、标签（可以选多个）
5. 点 **Publish** → 首页马上能看到

支持的 Markdown 语法：标准 CommonMark + GFM（表格、任务列表）+ 代码块高亮。

---

## 附录 B：怎么给朋友分配 AUTHOR 权限？

1. 让他自己去 `/register` 注册一个账号
2. 你用管理员账号登录 → 进 `/admin/users`
3. 在他那一行，把 **Role** 下拉从 `USER` 改成 `AUTHOR` 或 `ADMIN`

---

## 附录 C：怎么自定义域名？

Vercel 免费版支持绑定自己的域名：

1. 在任何域名商（Namecheap、GoDaddy、阿里云…）买一个域名
2. Vercel 项目 → Settings → Domains → Add
3. 按 Vercel 提示配置 DNS A 记录或 CNAME
4. **记得回来改 `AUTH_URL`** 为新域名，否则登录会出问题

---

## 附录 D：费用说明

目前配置下**完全免费**，不会产生任何费用：

| 服务 | 免费额度 | 这个项目的用量 |
|---|---|---|
| **Vercel Hobby** | 100 GB 带宽 / 月、无限静态请求 | 远低于额度 |
| **Neon Free** | 0.5 GB 存储、191 小时计算 / 月 | 一个小型博客远低于额度 |
| **GitHub Free** | 私有仓库无限 | — |

只有在流量爆炸（每月 10 万+ 访问）时才需要考虑升级。

---

部署过程中有任何一步卡住，把错误截图发给你朋友（就是我😄），逐步排查。祝一切顺利 🚀
