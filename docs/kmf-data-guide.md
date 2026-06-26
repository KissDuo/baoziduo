# KMF 数据提取与导入指南

> KMF（考满分）是剑桥雅思题目的主要数据源，替代 PDF 解析。本文档记录完整的获取、解析、导入流程。

---

## 一、获取 KMF 数据

### 1.1 前提条件
- 已登录 KMF（https://ielts.kmf.com）的账号
- 浏览器 F12 开发者工具

### 1.2 获取认证 Token

1. 登录 KMF 后，打开任意剑雅听力练习页面
2. F12 → Network → 筛选 XHR/Fetch
3. 找到 `practise-detail?u=...` 请求
4. 右键 → Copy → Copy as cURL
5. 将整条 curl 命令发给 Claude Code

**Token 有效期**：约 2 小时，过期需重新获取。

### 1.3 URL 格式

每个听力 section 对应一个独立的练习 ID（`u` 参数）：

```
https://api.kmf.com/ielts-app/front/practise-detail?u={18位数字ID}
```

例如：`https://api.kmf.com/ielts-app/front/practise-detail?u=178248974640518410`

KMF 将每个 section 拆成多组练习（如 T1P2 可能分 Q11-13、Q14-15、Q16-20 三组），一组一个 `u`。完整抓取需收集所有 `u`。

### 1.4 批量采集流程

1. 在 KMF 列表页过滤 "剑18/19/20" → 听力
2. 逐一点击"开始练习"
3. 每点一个，从 F12 Network 复制 `practise-detail` 的 curl
4. 发给 Claude Code，自动排队并行下载

---

## 二、数据存储位置

**铁律：KMF 数据必须直接存入 `apps/server/prisma/kmf-data/`，禁止存入 `/tmp`（会被清理）。**

### 2.1 原始 JSON
```
apps/server/prisma/kmf-data/
├── _mapping.json          # Sheet ID → 题型/题量 对照表
├── c18/                    # 剑18 原始数据（28个文件含阅读）
├── c19/                    # 剑19 原始数据（16个 section 全）
└── c20/                    # 剑20 原始数据（16个 section 全）
```
**当前完整度**：C18=28, C19=16, C20=16。每本书听力需 16 个唯一 sheet。

### 2.2 数据库种子
```
apps/server/prisma/
├── seed-ielts-c18.sql     # 剑18 听力+阅读，~125KB
├── seed-ielts-c19.sql     # 剑19 听力+阅读，~226KB
└── seed-ielts-c20.sql     # 剑20 听力+阅读，~223KB
```

导出命令：
```bash
DATABASE_URL="mysql://root:DCHdch1234.@123.56.146.148:3306/en?timezone=%2B08%3A00" \
  ./apps/server/node_modules/.bin/tsx /tmp/export-seeds.ts
```

---

## 三、KMF JSON 结构

### 3.1 顶层结构
```json
{
  "status": 200,
  "result": {
    "result": {
      "sheet_id": 952,
      "exam_unique": "178248974640518410",
      "question_count": 10,
      "subject": 2
    },
    "questions": [ ... ]
  }
}
```

- `sheet_id`：section 唯一编号，用于映射到我们的 section
- `question_count`：该组题目数
- `subject`：2=听力

### 3.2 Question 对象
```json
{
  "question": {
    "obj": {
      "type_cn": "听力图表题",        // 题型中文名
      "subject_cn": "LISTENING",
      "content": "<h3>...</h3><table>...",  // 题目内容 HTML
      "title": "Hinchingbrooke Country Park"
    },
    "ext": {
      "added_content": [               // 提示句
        { "ex_information": "Complete the notes below." },
        { "ex_information": "Write ONE WORD AND/OR A NUMBER for each answer." }
      ]
    }
  },
  "children": [ ... ],    // 子题（每道小题）
  "answer": [],
  "option": []
}
```

### 3.3 题型对照

| KMF type_cn | 我们的 questionType | 对应组件 |
|-------------|-------------------|---------|
| 听力图表题 | fill_blank | NoteModeGroup / TableGroup / FormFillBlank |
| 选择/判断/听力填空题 | multiple_choice | SingleChoice / MultiChoiceGroup |
| 听力配对题 | matching | MatchingGroup / FlowchartMatching |

### 3.4 题目内容格式

**填空（[note]/[table]）**：HTML 原文
- `[blank]1[/blank]` → 映射为 `{Q1}`（注意 P4 需 +30：`{Q31}`）
- `<h3><strong>Title</strong></h3>` → `## Title`
- `<p>text</p>` → 描述句
- `<table>` → `[table]` 格式，需手动转为 `| col1 | col2 |` 管道格式

**MC 单选**：`children[].answer[]` 含 3 个选项，`correct` 标记正确答案
- 需加 A/B/C 前缀，存入 `options` JSON 数组

**MC 多选**：`children[].relative_seq` = `[N, N+1]`，一个 child 对应 2 题
- `answer[]` 含 5 个选项，`correct` 标记 2 个正确答案

**匹配**：`children[].answer[0].ext.choice[0].ex_information` = 字母 (a-f)
- 需转为大写，加前缀存储为 `correctAnswer`
- 匹配条目名称从 `children[].question.obj.content` 获取（去除 `[match]N[/match]` 标记）

### 3.5 Child 对象（小题）

```json
{
  "relative_seq": ["11"],        // 题号（或 ["17","18"] 表示多选共享）
  "question": { "obj": { "content": "题干预文本" } },
  "answer": [
    {
      "obj": { "content": "选项文本或答案" },
      "ext": {
        "choice": [{ "ex_information": "a" }],   // 匹配题字母
        "correct": [{ "ex_information": "correct" }] // 正确答案标记
      }
    }
  ],
  "option": []   // MCQ 选项（有时为空，选项在 answer 中）
}
```

---

## 四、导入流程

### 4.1 完整导入脚本模式

```typescript
// 1. 获取 KMF 数据
const data = JSON.parse(readFileSync('kmf-data/c20/xxx.json'));

// 2. 识别题型
const typeCn = data.result.questions[0].question.obj.type_cn;

// 3. 根据题型提取：
//    - 填空 → 解析 content HTML，[blank]N → {QN}，构建 passageText
//    - MC → 从 children[].answer[] 提取选项和正确答案
//    - 匹配 → 从 children[].answer[0].ext.choice 提取字母映射

// 4. 更新数据库
await prisma.iELTSQuestion.update({ where: { id }, data: { ... } });
await prisma.iELTSExamSection.update({ where: { id }, data: { instructions: ... } });

// 5. 导出种子
```

### 4.2 关键映射

**KMF [blank]N → 我们 Q 号**：
- P1/P2/P3：`[blank]1` → `{Q1}`，直接映射
- P4：`[blank]1` → `{Q31}`，需 +30

**KMF sheet_id → 我们的 sectionId**：
```
C18: 373=T1P1, 374=T1P2, 375=T1P3, 376=T1P4, 377=T2P1, ...
C19: 390=T1P1, 391=T1P2, ...（待完整收集）
C20: 952=T1P1, 953=T1P2, 954=T1P3, 955=T1P4,
     956=T2P1, 957=T2P2, 958=T2P3, 959=T2P4,
     960=T3P1, 961=T3P2, 962=T3P3, 963=T3P4,
     964=T4P1, 965=T4P2, 966=T4P3, 967=T4P4
```

### 4.3 注意事项

1. **匹配题指令**：KMF 使用 `drag`，我们需改为 `write` 以兼容前端 `getListeningMatchHint` 正则
2. **MC 选项格式**：必须加字母前缀（A. / B. / C.），存储为 JSON 数组
3. **表格数据**：KMF 的 HTML `<table>` 需手动转为 `[table]\n| col | col |\n| data |` 管道格式
4. **多选映射**：`relative_seq: [27,28]` 表示 Q27 和 Q28 共享同一组选项
5. **匹配题 questionText**：从 `children[].question.obj.content` 提取，需去掉 `[match]N[/match]` 标记

---

## 五、已有 KMF 数据状态

| 书 | 听力 section 数 | KMF 文件数 | 答案 | passageText | 选项/stem |
|----|---------------|-----------|------|-------------|-----------|
| C18 | 16 | 12 个（部分） | ✅ | ✅ (OCR补充) | ✅ |
| C19 | 16 | 完整 | ✅ | ✅ | ✅ |
| C20 | 16 | 16 个（完整） | ✅ | ✅ | ✅ |

### 待补充
- C18 KMF 数据：缺 T1P2(部分)、T1P3、T2P2 等的 KMF 原始文件（已有答案来自早期抓取）
- C19/C20 阅读部分：未从 KMF 抓取

---

## 六、音频

听力音频存储在阿里云 OSS：
```
https://yxzm-audio.oss-cn-beijing.aliyuncs.com/Cambridge-IELTS-{book}/T{test}/S{section}.mp3
```

已为 C18/C19/C20 全部 48 个 section 写入 `IELTSExamSection.audioUrl`。

---

## 七、新增题库 checklist

1. 从 KMF 抓取所有 section 的 `practise-detail` JSON → 存入 `kmf-data/`
2. 运行导入脚本：解析 content、提取答案/选项/stem
3. 运行 `/tmp/export-seeds.ts` 导出 SQL 种子
4. 更新音频 URL（OSS 上传后）
5. 更新地图图片 URL（OSS 上传后）
6. 更新本文档的"已有数据状态"表格
7. 更新 `ielts-exam-matrix.md` 矩阵
