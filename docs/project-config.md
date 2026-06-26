# 项目配置与架构

## 英语学习平台（English Learning Platform）

### 核心定位
- 英语学习网站，后期可能扩展为通用语言学习平台
- 支持**电脑端**和**移动端**（两套独立前端，不做响应式）
- 服务器：阿里云

### 技术栈
| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Next.js 15 (App Router) | PC + Mobile 两套 UI |
| 后端 | Node.js + Express 4 | ESM 模块，端口 5201 |
| 数据库 | MySQL 8.0 (Prisma ORM) | 阿里云 123.56.146.148:3306 |
| 构建 | Turborepo + pnpm workspace | Monorepo |
| 样式 | Tailwind CSS 3 | 自定义 primary 蓝色 |
| 类型 | Zod + @english/shared | 前后端共享模式库 |
| CI/CD | GitHub Actions | 推送到 main 触发 |

### 项目结构
```
english-learning-platform/
├── apps/
│   ├── server/          # Express API (@english/server)
│   └── web/             # Next.js 前端 (@english/web)
├── packages/
│   ├── config/          # 共享 tsconfig
│   └── shared/          # Zod 模式库 (@english/shared)
└── .github/workflows/   # CI
```

---

## 架构决策 (ADR)

### ADR-1: 两套前端而非响应式
- PC 和移动端独立 UI，通过 `userAgent()` 检测 + viewport cookie 切换布局
- 移动端自动被重定向离开 `/ielts` 路由

### ADR-2: 双 Token JWT 认证
- Access token (JWT, 15min) + Refresh token (随机 hex, 7天, 存数据库)
- httpOnly cookie 传递，支持 Bearer header 降级
- Token 轮换防重放（refresh 时删除旧 token 颁发新对）

### ADR-3: Monorepo + 共享模式库
- pnpm workspace + Turborepo + @english/shared (Zod)
- 后端 `validate()` 中间件，前端 `z.infer<>` 提取类型

### ADR-4: MySQL + Prisma
- MySQL 8.0，Prisma 类型安全查询
- 迁移文件在 `.gitignore`，每个环境独立运行迁移

### ADR-5: ESM 模块
- 后端 `"type": "module"`，tsx watch 热重载
- 导入用 `.js` 扩展名

### ADR-6: 阿里云部署
- 服务器在阿里云，具体部署方案待定

---

## 主要模块（按优先级）
1. **注册登录** — 微信、邮箱、短信
2. **会员制付费** — 微信支付、支付宝
3. **雅思模拟考试** — 听力、阅读，仅 PC 端
4. **外刊阅读** — 点击查词/音标/用法、生词库、段落翻译
5. **背单词** — CET4/CET6/IELTS/TOEFL/GRE/自定义词书

---

## API 路由

### Auth: `/api/v1/auth`
- `POST /email/send-code` — 发验证码
- `POST /register/email` — 邮箱注册
- `POST /login/email` — 邮箱登录
- `POST /refresh` — 刷新令牌
- `POST /logout` — 撤销令牌

### Articles: `/api/v1/articles`
- `GET /` — 文章列表
- `GET /:slug` — 文章详情
- `GET /:slug/words/:word` — 查词
- `PATCH /:slug/progress` — 阅读进度

### Vocabulary: `/api/v1/vocabulary`
- `POST /` `GET /` `DELETE /:id` — 生词本 CRUD
- `GET /search` — 搜索
- `GET /books` — 词书列表
- `GET /books/:slug/words` — 词书单词
- `POST /books/:slug/progress` — 学习进度

### IELTS: `/api/v1/ielts`
- `GET /exams` — 考试列表
- `GET /exams/:id` — 考试详情
- `POST /exams/:id/start` — 开始/恢复
- `POST /attempts/:id/answer` — 保存答案
- `POST /attempts/:id/submit` — 提交评分
- `GET /attempts/:id/result` — 查看结果

---

## 词库 (6本书)

| slug | 书名 | 词数 |
|------|------|------|
| gaokao-3500 | 高考核心词汇 | 3,784 |
| kaoyan-core | 考研核心词汇 | 5,187 |
| cet4-4500 | 四级核心词汇 | 4,481 |
| cet6-core | 六级核心词汇 | 5,583 |
| ielts-vocab-real | 雅思核心词汇 | 3,340 |
| toefl-core | 托福核心词汇 | 4,144 |

---

## 数据库模型

### 核心表
- **User**: id, email, phone, passwordHash, nickname, membership
- **RefreshToken**: token(unique), userId, expiresAt
- **Article**: title, titleZh, slug, summary, content, difficultyLevel
- **ArticleParagraph**: articleId, paragraphIndex, contentEn, contentZh
- **WordAnnotation**: word(@unique), phoneticUk, phoneticUs, partOfSpeech, translation, examplesJson
  - 变形字段: nounId, verbId, adjId, advId, pastTenseId, pastParticipleId
  - 字符串字段: thirdPersonSingular, plural
- **VocabularyBook**: name, slug(@unique), category, totalWords
- **VocabularyWord**: bookId, wordAnnotationId, word, wordIndex
- **UserVocabulary**: userId, wordAnnotationId, masteryLevel(0-5), nextReviewAt
- **IELTSExam**: title, type(listening/reading), totalQuestions
- **IELTSExamSection**: examId, sectionIndex, title, audioUrl
- **IELTSQuestion**: sectionId, questionType, questionText, options(JSON), correctAnswer
- **IELTSAttempt**: userId, examId, status(in_progress/submitted), totalScore
- **IELTSUserAnswer**: attemptId, questionId, userAnswer, isCorrect

---

## 实现状态（截至 2026-06-17）

### ✅ 已完成
- 认证系统（邮箱/短信注册登录、JWT双token、限流）
- 前端布局（PC/Mobile Shell、设备检测中间件）
- 共享模式库 (@english/shared)
- 数据库模型 (Prisma)
- CI/CD (GitHub Actions)
- 外刊阅读模块（文章列表/详情/查词/翻译/进度/生词本，PC+Mobile）
- IELTS 考试模块（C18/C19/C20 听力+阅读，480题）

### ❌ 待实现
- 用户系统（信息获取/更新、头像上传）
- 词汇/背单词模块
- 会员/支付模块
- 单元/集成测试

---

## 关键约定
- 词间共享数据通过 WordAnnotation(word @unique) 实现
- 新词导入先查 WordAnnotation → 已有则打标签，无则调 AI
- 词汇学习: FlashcardMode + SpellMode
- 间隔重复: masteryLevel 0-5，间隔 1/3/7/30 天
- 登录用 httpOnly cookie，前端 api-client 自动 401 刷新
- 代码修改后 commit + push 到 `KissDuo/baoziduo`
