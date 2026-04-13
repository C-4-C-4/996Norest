# Norest - 职场避雷与公开信息整理平台

## 📖 这是什么项目
Norest 是一个旨在**整理和公开劣质公司（如欠薪、强制996、存在霸王条款等违规行为）的材料与个人经历陈述**的平台。项目名称 "Norest" 取自“No Rest（无休止的压榨）”的反讽，致力于帮助打工人在求职时避开不良企业，维护自身合法权益。

> **免责声明**：本站内容均为个人经历陈述与公开材料索引。本站不对其中提到的任何公司或个人做最终法律定性。请阅读者注意甄别事实与主观观点，一切以法律裁判为准。

## ✨ 主要功能
1. **公开避雷名单**：浏览已知存在违规行为的公司列表，支持分类查看（如欠薪、霸王条款等）。
2. **多维度的企业档案**：
   - **事实摘要**：直击核心违规点，并附有证据链接（如裁判文书、新闻报道）。
   - **时间线追踪**：按时间顺序还原维权或侵权事件的全过程，了解事态发展。
   - **条款拆解**：针对公司合同中的“坑（霸王条款）”进行拆解，指出风险并给出应对建议。
3. **提交曝光**：公众可通过平台提交自己遭遇的职场不公经历与证据（提交后默认进入草稿箱，需管理员审核）。
4. **管理员后台**：提供后台管理系统，方便管理员审核公众提交的线索，并对公司数据、站点设置进行增删改查。

## 🛠 技术栈
该项目采用现代化的全栈技术栈，专为**轻量化部署和边缘计算**设计：
- **前端**：React + Vite + Tailwind CSS + Framer Motion (动画) + Zustand (状态管理)
- **后端**：[Hono](https://hono.dev/) (轻量级边缘计算框架，运行在 Cloudflare Workers)
- **数据库**：Cloudflare D1 (基于 SQLite 的 Serverless 数据库)
- **部署方案**：Cloudflare Pages + Pages Functions

## 🚀 部署方式 (部署到 Cloudflare)
本项目专为 Cloudflare 生态打造，你可以免费且快速地将其部署到全球边缘节点。

### 准备工作
1. 确保已安装 Node.js (v18+)
2. 注册并登录一个 [Cloudflare](https://dash.cloudflare.com/) 账号

### 部署步骤
1. **安装依赖**
   ```bash
   npm install
   ```

2. **登录 Cloudflare**
   ```bash
   npx wrangler login
   ```
   *根据终端提示在浏览器中完成授权。*

3. **创建 D1 数据库**
   ```bash
   npx wrangler d1 create norest-db
   ```
   *执行后终端会打印出一个表格，复制表格中的 `database_id` 值。*

4. **配置数据库关联**
   打开项目根目录的 `wrangler.toml` 文件，将刚刚复制的 ID 填入：
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "norest-db"
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # <--- 替换这里
   ```

5. **修改安全密钥 (重要)**
   同样在 `wrangler.toml` 中，修改 `JWT_SECRET` 为一串复杂且保密的随机字符串，用于保护管理员的登录状态：
   ```toml
   [vars]
   JWT_SECRET = "请替换为你的强随机密码"
   ```

6. **初始化线上数据库表结构**
   将本地准备好的 `schema.sql` 导入到你的 Cloudflare D1 中，这会自动创建所有必要的表并生成默认管理员账号：
   ```bash
   npx wrangler d1 execute norest-db --remote --file=./schema.sql
   ```

7. **构建与部署**
   先打包前端产物，然后使用 Wrangler 推送到 Cloudflare Pages：
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=norest
   ```
   *如果终端询问是否创建名为 norest 的项目，选择 `y` 同意即可。*

部署完成后，终端会返回你的线上访问链接（类似 `https://norest.pages.dev`）。

## 💻 本地开发指南
如果你想在本地对代码进行二次开发：
1. 本地启动（集成了 Vite 前端与 Hono 后端）：
   ```bash
   npm run dev:cf
   ```
2. **管理员账号**：数据库初始化后，默认的管理员账号为：
   - 用户名：`admin`
   - 密码：`123456`
   *(建议部署上线后立即在后台修改默认密码或禁用该账号新建强密码账号)*

## ⚠️ 注意事项与合规建议
1. **密钥安全**：绝对不要将真实的 `JWT_SECRET` 提交到公开的 GitHub 仓库。建议在 Cloudflare 仪表盘的项目环境变量设置中覆盖该值。
2. **内容审核**：这是一个用户可以自由提交线索的平台。为了避免法律纠纷，请务必在后台严格审核“草稿”状态的提交。只发布那些**有确凿证据**（如判决书、录音录像、官方公告）的内容。
3. **数据备份**：建议定期在 Cloudflare 控制台或通过 Wrangler 命令导出 D1 数据库的备份，以防数据丢失。

## 📄 许可证
本项目采用 MIT 许可证。你可以自由使用、修改和分发代码，但须保留原作者的版权声明。
