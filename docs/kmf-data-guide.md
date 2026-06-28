# KMF 数据完整参考指南

> KMF（考满分）是剑桥雅思题目的**唯一数据源**。本文档是 KMF 数据格式、类型系统、字段映射的唯一真相源。

---

## 一、获取 KMF 数据

### 1.1 API
```
https://api.kmf.com/ielts-app/front/practise-detail?u={18位数字ID}
```
需 Bearer token（浏览器 F12 → Copy as cURL），有效期约 2 小时。

### 1.2 数据存储铁律
KMF 原始 JSON **必须**存入 `apps/server/prisma/kmf-data/`，**禁止**存入 `/tmp`。

```
kmf-data/
├── _mapping.json                              # sheet_id → 题型/题量 对照表
├── c18/ c19/ c20/                             # 听力原始数据（按 sheet_id 命名）
├── c18-reading/ c19-reading/ c20-reading/     # 阅读原始数据（按 sheet_id 命名）
├── c18_listening_t1p1.json ...                # 听力 flat file（按 Test/Part 命名，优先使用）
└── c18_reading_t1p1.json ...                  # 阅读 flat file（按 Test/Part 命名，优先使用）
```

**命名规范**：`c{book}_{module}_t{test}p{part}.json`
- module = `listening` 或 `reading`
- 例：`c18_listening_t2p2.json` = C18 听力 Test 2 Part 2
- 例：`c19_reading_t3p1.json` = C19 阅读 Test 3 Part 1

**数据源优先级**：flat file（`c18_listening_t2p2.json`）> 子目录（`c18/xxx.json`）。flat file 文件名明确标注了 Book/Module/Test/Part，**永不混淆**。sheet_id 不可信（C18 T2P2 的 sheet_id 和 T4P2 的 sheet_id 无固定规律）。两者数据冲突时，以 flat file 为准。

**⚠️ 铁律：DB 损坏时先找已存储的 KMF 数据，不要直接跟用户要 curl**。所有 curl 获取的数据都已存入 `kmf-data/`。DB 数据坏了 ≠ KMF 数据缺失。先在 `kmf-data/` 里找，找不到再问。

---

## 二、KMF JSON 顶层结构

```
{
  status: 200,
  message: "OK",
  result: {
    result: {           ← 考试元数据
      sheet_id, exam_unique, subject(1=阅读/2=听力),
      mode(8=听力/18=阅读), question_count, ...
    },
    questions: [...]    ← 题组数组
  }
}
```

### 2.1 `result.result` 字段全解

| 字段 | 类型 | 含义 | 用途 |
|------|------|------|------|
| `sheet_id` | number | Section 唯一编号 | 映射到我们的 sectionId |
| `subject` | number | 1=阅读, 2=听力 | 区分听阅 |
| `mode` | number | 8=听力, 18=阅读 | 同 subject 冗余 |
| `exam_unique` | string | 18位练习ID | URL 中的 `u` 参数 |
| `question_count` | number | 该组题数 | 校验 |
| `version` | number | 固定 1 | 无用 |
| `cost_total` | number | 固定 0 | 用户状态，无用 |
| `question_correct` | number | 固定 0 | 用户状态，无用 |
| `stat_section` | object | 题型分布统计 | 无用 |
| `total_time` | number | 固定 0 | 用户状态，无用 |
| `uid` | number | 用户ID | 无用 |

### 2.2 `result.questions[]` 结构

每个元素是一个**题组**（大题），包含：
- `question` — 题组元信息
- `parent` — 所属文章/听力材料（祖题目）
- `children[]` — 子题（小题）
- `answer[]` — 题组级选项列表（匹配题用）
- `option[]` — 始终为空

---

## 三、KMF 两级类型系统

KMF 使用**两级类型**：Group 级（题组外观）+ Child 级（单题交互）。

### 3.1 Group 级 type（`result.questions[].question.obj.type`）

控制在 `content` 中的呈现方式 + 子题集合类型。

| type | type_cn | 子题 type | 出现模块 | 数量 | 我们映射为 |
|------|---------|-----------|---------|------|-----------|
| **692** | 听力图表题 | 404 | 听力 P1/P4 | 26组 | fill_blank → NoteModeGroup / TableGroup / FormFillBlank |
| **694** | 听力配对题 | 405 | 听力 P2/P3 | 15组 | matching → MatchingGroup / FlowchartMatching |
| **691** | 选择/判断/听力填空题 | 101/404/611/711 | 听阅混合 | 91组 | 按 child type 分派 |
| **686** | 不带词库的summary题 | 404 | 阅读 | 27组 | fill_blank → SummaryCompletion / FillBlank |
| **680** | 带词库的summary题 | 406 | 阅读 | 8组 | matching → MatchingGroup |
| **683** | 拖拽配对题 | 405 | 阅读 | 12组 | matching → MatchingGroup |
| **684** | 题干被包含配对题 | 405 | 阅读 | 12组 | matching → MatchingGroup |
| **685** | list of heading题 | 406 | 阅读 | 3组 | matching → MatchingGroup |
| **681** | Sentence completion题 | 403 | 阅读 | 1组 | fill_blank → FillBlank |

### 3.2 Child 级 type（`children[].question.obj.type`）

控制单道题的交互方式 + 答案结构。

| type | type_cn | 数量 | answer 结构 | 我们的 questionType |
|------|---------|------|------------|-------------------|
| **101** | 单选题 | 143 | 3选项，1 correct | `multiple_choice` |
| **404** | 不带内容的填空题 | 344 | 1答案，content=答案词 | `fill_blank` |
| **403** | 带内容的填空题 | 14 | 1答案，content=答案词 | `fill_blank` |
| **405** | 带内容的拖拽题 | 186 | 1选项，choice=字母 | `matching` |
| **406** | 不带内容的拖拽题 | 62 | 1选项，choice=字母 | `matching` |
| **611** | 多选题 | 33 | 5选项，2 correct | `multiple_choice` |
| **711** | 判断题 | 122 | 3选项(TRUE/FALSE/NG)，1 correct | `true_false` / `yes_no` |

### 3.3 Group 级 type 详细说明

#### 692 — 听力图表题（Listening P1/P4）
- **子题型**: 404（不带内容的填空题）
- **content 格式**: BBCode + HTML table/列表
  - `[center][b]Title[/b][/center]` → 标题
  - `<h2>Subtitle</h2>` → 子标题
  - `● text [blank]1[/blank]` → 填空行
  - `<table>...</table>` → 表格
- **content 渲染规则**:
  - 有 `<table>` → TableGroup（管道格式）
  - 有 `<h2>` 子标题 → NoteModeGroup
  - 有 `[form]` 语义 → FormFillBlank
  - 其他 → NoteModeGroup
- **parent**: 有（393 听力祖题目），但 content 为空
- **special_info**: 有（地图图片 URL，map labelling 用）
- **added_content**: 指令如 `Complete the notes below. Write ONE WORD ONLY...`
- **模块**: 每本书 T1-4 P1/P4

#### 694 — 听力配对题（Listening P2/P3）
- **子题型**: 405（带内容的拖拽题）
- **content**: 只有标题 `[center][b]Title[/b][/center]`
- **answer[]**: 全部选项列表（A-F/H）
  - `obj.content`: 选项文本
  - `ext.choice[0].ex_information`: 字母 a/b/c...
- **parent**: 有，content 为空
- **模块**: C18 T1P2 Q16-20, T1P3 Q25-28, T2P3 Q27-30 等

#### 691 — 选择/判断/听力填空题（听阅混合，最复杂）
- **子题型**: 101(单选) / 404(填空) / 611(多选) / 711(判断)
- **content**: 标题 `[center][b]Title[/b][/center]`
- **一个 group 内子题类型可混合**（如 MC 和填空同组）
- **按子题 type 分派组件**: 101→SingleChoice, 611→MultiChoiceGroup, 711→TrueFalse, 404→FillBlank
- **business_type 细分**:
  - 1000/1001/1002: 听力单选/多选
  - 1100/1101/1102: 阅读判断/单选/多选
- **模块**: 听力和阅读均有，遍布 P2/P3 和阅读全部 passage

#### 686 — 不带词库的summary题（阅读）
- **子题型**: 404（不带内容的填空题）
- **content**: 文章摘要含 `[blank]N[/blank]` 填空标记（BBCode 格式）
- **清理后**: `[blank]N[/blank]` → `(N) ______`，标题加 `##` 前缀
- **parent**: 有（392 阅读祖题目），content=文章正文
- **模块**: 遍布阅读全三本书

#### 680 — 带词库的summary题（阅读）
- **子题型**: 406（不带内容的拖拽题）
- **content**: 文章摘要含 `[match]N[/match]` 标记
- **answer[]**: 选项词/短语列表
- **提示语**: `Complete the summary using the list of words/phrases, A-J, below.`
- **模块**: C18T1P3 Q27-31, C18T2P2 Q24-26 等

#### 683 — 拖拽配对题（阅读匹配）
- **子题型**: 405（带内容的拖拽题）
- **answer[]**: 选项短语列表（如 "a TSI Cut"）
- **提示语**: `Look at the following statements... and the list of people/items below.`
- **特点**: 选项是**短语文本**

#### 684 — 题干被包含配对题（阅读段落信息匹配）
- **子题型**: 405（带内容的拖拽题）
- **answer[]**: 纯字母选项（A, B, C...）
- **提示语**: `Which paragraph/section contains the following information?`
- **特点**: 选项是**纯字母**

#### 685 — list of heading题（阅读标题匹配）
- **子题型**: 406（不带内容的拖拽题）
- **answer[]**: 标题文本列表
- **提示语**: `Choose the correct heading for each paragraph/section.`
- **模块**: C18T3P2 Q14-20, C20T2P2 Q14-19

#### 681 — Sentence completion题（阅读）
- **子题型**: 403（带内容的填空题）
- **仅1组**: C20 T4P2 Q18-22
- **提示语**: `Complete the sentences below. Choose ONE WORD ONLY...`
- **映射**: fill_blank

### 3.4 business_type 速查表

| business_type | 含义 | 对应 group type |
|---------------|------|----------------|
| 1000/1001/1002 | 听力选择/判断混合 | 691 |
| 1004 | 听力配对 | 694 |
| 1006 | 听力图表/填空 | 692 |
| 1100/1101/1102 | 阅读选择/判断混合 | 691 |
| 1103 | 阅读 summary（无词库） | 686 |
| 1104 | 阅读段落信息匹配 | 684 |
| 1105 | 阅读 summary（有词库） | 680 |
| 1107 | 阅读拖拽配对 | 683 |
| 1108 | 阅读 heading 匹配 | 685 |
| 1109 | 阅读句子填空 | 681 |

---

## 四、字段到我们系统的映射

### 4.1 文章正文 (passageText / instructions)

```
KMF: result.questions[].parent.question.obj.content
  ↓ cleanKmfPassage()
  ↓ 存入 DB
IELTSExamSection.instructions = passage + "\n\n" + questionInstructions
```

- **parent 存在条件**: 阅读全有（type 392 祖题目），听力有 parent 但 content 为空
- **parent.question.obj.title**: 文章标题
- **parent.question.obj.html_content**: HTML 版正文（备用，优先用 content）

### 4.2 题目指令 (instructions)

```
KMF: result.questions[].question.ext.added_content[]
  ↓ 每个 entry.ex_information 是 HTML 片段
  ↓ 去 HTML 标签 + 拼接
IELTSExamSection.instructions (后半部分)
```

- **ex_property_id**: 固定 "6"（表示提示语）
- **格式**: `<div class="selection-inline js-selection-note">text</div><b>bold</b>...`
- **处理**: 去除所有 HTML 标签，`<b>` 内容保留为纯文本

### 4.3 题目内容 (questionText) — 三种来源

**来源1（默认）：child 级 content**
```
KMF: children[].question.obj.content
  ↓ （去掉 [blank]N[/blank] → ______）
  ↓ （去掉 [match]N[/match] → 去除）
IELTSQuestion.questionText
```1
适用于 child type 101（单选）、611（多选）、405（带内容拖拽）、711（判断）。

**来源2：Group 级 content（type 680/686/692）**
```
KMF: question.obj.content  ← Group 级！child content 为空
  ↓ 按 [br]/[br/] 分行
  ↓ [blank]N[/blank] / [match]N[/match] → 确定该行属于 QN
  ↓ 清洗 BBCode/HTML → 得到每道题的 questionText
IELTSQuestion.questionText
```
详见第十章。

**来源3：多选题共享**
```
KMF: relative_seq: ["17","18"]  ← 一个 child 对应多道题
  ↓ 同一个 child.question.obj.content → Q17 & Q18 共用
IELTSQuestion.questionText
```

### 4.4 填空 passageText (686/692 型)

```
KMF: result.questions[].question.obj.content
  ↓ BBCode 清洗 + [blank]N[/blank] → (N) ______
  ↓ HTML table → | col | col | 管道格式
IELTSQuestion.passageText
```

### 4.5 选项 (options)

**单选/多选 (child type 101/611)**:
```
children[].answer[] 每个选项:
  obj.content = 选项文本（如 "He was eager to develop a hobby."）
  ext.choice[0].ex_information = 字母 a/b/c/d/e
  ext.correct[] = 含 "correct" 标记

前端需要: ["A. He was eager...", "B. He wanted...", "C. He found..."]
          → 字母由 ext.choice 提供，content 由 obj.content 提供
          → 拼接: letter.toUpperCase() + ". " + content
          → 存入 options JSON 数组
```

**匹配题 (group type 680/683/684/685/694)**:
```
Group 级 answer[] 每个选项:
  obj.content = 选项文本（如 "one shoe was missing"）
  obj.option_name = 可选字母（如 "A"，nullable！）
  ext.choice[0].ex_information = 字母 a/b/c...

前端需要: ["one shoe was missing", "the colour...", ...]
          → 不带字母前缀！MatchingGroup 渲染时自动加 A/B/C
```

### 4.6 正确答案 (correctAnswer)

**填空 (404/403)**: `children[].answer[0].obj.content` = 答案词
- 可能有变体如 `"discs,disks"` → 存原样

**单选 (101)**: 找 `correct` 标记的 answer → 取其 `obj.content`
- 格式: `"C. He found his job..."`（字母 + 文本）

**多选 (611)**: 找所有 `correct` 标记的 answers → 取 content 列表
- `relative_seq: ["27","28"]` 表示该 child 对应 Q27 和 Q28 两题

**判断 (711)**: `obj.content` = `TRUE`/`FALSE`/`NOT GIVEN`
- 需根据提示语判断是 TRUE/FALSE 还是 YES/NO

**匹配 (405/406)**: `children[].answer[0].ext.choice[0].ex_information` = 字母(b) → 大写(B)

### 4.7 图片 URL (imageUrl)

```
KMF: result.questions[].question.ext.special_info[]
  ↓ ex_property_id = "9"
  ↓ ex_information = "https://img.kmf.com/kaomanfen/img/ielts/xxx.png"
IELTSExamSection.imageUrl
```

- 只有类型 686（summary）和 692（听力图表/地图）有 special_info
- 地图题（map_labelling）的图片由此字段提供

### 4.8 题号 (questionIndex)

```
KMF: children[].relative_seq = ["11"] 或 ["27","28"]（多选）
  ↓ [0] 即题号
IELTSQuestion.questionIndex
```

---

## 五、BBCode / HTML 格式标记完整清单

### 5.1 BBCode 标记（在 `content` 字段中）

| 标记 | 出现次数 | 含义 | 处理方式 |
|------|---------|------|---------|
| `[br/]` | 885 | 换行 | → `\n` |
| `[br/][br/]` | — | 段落分隔 | 先处理：→ `\n\n` |
| `[blank]N[/blank]` | 364对 | 第N个填空 | → `(N) ______` |
| `[match]N[/match]` | 167对 | 第N个匹配空 | → 去除 |
| `[b]...[/b]` | 145对 | 加粗 | → 去除标签，保留文本 |
| `[center]...[/center]` | 79对 | 居中 | → 去除标签，保留文本 |
| `[p:A]`..`[p:H]` | 47+47+... | 段落标记字母 | → `\n\nA\n`（大写，单独成行） |
| `[i]...[/i]` | 5对 | 斜体 | → 去除标签，保留文本 |
| `[insert:N]` | 76 | 插入位置标记 | → 去除（仅供 KMF 内部用） |
| `[img]...[/img]` | 4对 | 图片 | → 去除 |
| `[P:A]` 大写变体 | 少见 | 与 `[p:a]` 同 | → 同 `[p:A]` 处理 |
| 损坏标签 `[xxx yyy]` | 少数 | KMF bug | → 去除外层 `[]` |

### 5.2 HTML 标签（在 `html_content` 字段中，备用）

| 标签 | 用途 |
|------|------|
| `<p>`, `</p>` | 段落 |
| `<table>`, `<tr>`, `<td>` | 表格 |
| `<strong>`, `</strong>` | 加粗 |
| `<h2>`, `</h2>`, `<h3>`, `</h3>` | 子标题 |
| `<span style="...">` | 内联样式（font-size, font-weight） |
| `<br/>` | 换行 |
| `<tbody>` | 表格体 |

### 5.3 HTML 实体

| 实体 | 含义 |
|------|------|
| `&nbsp;` | 空格（1492次） |
| `&quot;` | 双引号 |
| `&amp;` | & 符号 |

---

## 六、数据清洗规则

### 6.1 `cleanKmfPassage()` — 文章正文

```typescript
function cleanKmfPassage(raw: string): string {
  return raw
    // 1. [p:X] → 段落字母单独成行
    .replace(/\[p:([a-z])\]/gi, (_, l) => `\n\n${l.toUpperCase()}\n`)
    .replace(/\[P:([a-z])\]/gi, (_, l) => `\n\n${l.toUpperCase()}\n`)  // 大写变体
    // 2. [br/][br/] 或 [br][br] → 段落间空行（必须在单个[br]之前处理！）
    .replace(/\[br\/\]\s*\[br\/\]/gi, '\n\n')
    .replace(/\[br\]\s*\[br\]/gi, '\n\n')      // ⚠️ KMF 同时使用 [br] 和 [br/]
    // 3. [br/] 或 [br] → 换行
    .replace(/\[br\/\]/gi, '\n')
    .replace(/\[br\]/gi, '\n')                   // ⚠️ 必须两种都处理
    // 4. 去除 [insert:N] 标记（KMF 内部用）
    .replace(/\[insert:\d+\]/gi, '')
    // 5. 去除 BBCode 格式化标签
    .replace(/\[\/?(?:center|b|i|h\d|strong)\]/gi, '')
    // 5. 去除 [insert:N] 标记
    .replace(/\[insert:\d+\]/gi, '')
    // 6. 修复损坏标签 [xxx yyy] → xxx yyy
    .replace(/\[(\w+\s+\w+)\]/gi, '$1')
    // 7. HTML 实体解码
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    // 8. 清理残留 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 9. 规范化空白
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
```

### 6.2 `cleanKmfGroupContent()` — 题组内容（填空 passageText）

```typescript
function cleanKmfGroupContent(raw: string): string {
  return raw
    // [center][b]Title[/b][/center] → ## Title
    .replace(/\[center\]\[b\](.+?)\[\/b\]\[\/center\]/gi, '## $1')
    // [blank]N[/blank] → (N) ______
    .replace(/\[blank\](\d+)\[\/blank\]/gi, '($1) ______')
    // 其余同 cleanKmfPassage
    .replace(/\[br\/\]\s*\[br\/\]/gi, '\n\n')
    .replace(/\[br\/\]/gi, '\n')
    .replace(/\[\/?(?:center|b|i|h\d|strong)\]/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
```

### 6.3 HTML 表格 → 管道格式

KMF 的 HTML `<table>` 需转换为管道格式：
```
原始: <table><tbody><tr><td>H1</td><td>H2</td></tr>...</table>
转换: | H1 | H2 |
      | data1 | data2 |
```

### 6.4 added_content → 纯文本指令

```
原始: <div class="selection-inline js-selection-note">Complete the notes below.</div>
      <div class="selection-block"></div>
      <div class="selection-inline js-selection-note">Write</div>
      <b> ONE WORD ONLY </b>

处理: 去所有 HTML 标签 → "Complete the notes below. Write ONE WORD ONLY."
```

---

## 七、Group type → 组件分派逻辑

```
if group.type === 692 (听力图表题):
  if content has <table>          → TableGroup
  elif content has <h2>/<h3>      → NoteModeGroup
  elif content has [form] 语义    → FormFillBlank
  else                            → NoteModeGroup

if group.type === 694 (听力配对题):
  if content has flowchart 语义   → FlowchartMatching
  else                            → MatchingGroup

if group.type === 691 (选择/判断/填空题):
  by child.type:
    101 (single choice)           → SingleChoice
    611 (multi choice)            → MultiChoiceGroup
    711 (T/F/NG, Y/N/NG)          → TrueFalse
    404 (fill blank)              → FillBlank

if group.type === 686 (不带词库summary):
                                  → SummaryCompletion / FillBlank

if group.type === 680/683/684/685:
                                  → MatchingGroup

if group.type === 681 (sentence completion):
                                  → FillBlank
```

---

## 八、数据校验检查清单

每次导入/修改后必须检查：

1. **文章正文**: parent 的 `content` 是否完整（非空、BBCode 已清洗）
2. **题目指令**: `added_content` 是否提取为纯文本、拼接到 instructions
3. **填空 passageText**: `[blank]` 是否转为 `(N) ______`、标题有 `##` 前缀
4. **匹配选项**: Group 级 `answer[]` 是否完整、不含字母前缀
5. **单选选项**: 字母（来自 `ext.choice`）+ 文本（来自 `obj.content`）拼接存入 options JSON
6. **正确答案**: 填空取 `obj.content`、匹配取 `choice 字母`、判断取 `obj.content`
7. **图片 URL**: `special_info` 中的 `ex_information` 是否写入 `imageUrl`
8. **题号**: `relative_seq[0]` 是否匹配 questionIndex

---

## 九、已有数据状态

| 书 | 听力 | 阅读 | 文章来源 | 总题数 |
|----|------|------|----------|--------|
| C18 | 16/16 ✅ | 12/12 ✅ | KMF parent | 320 |
| C19 | 16/16 ✅ | 12/12 ✅ | KMF parent | 320 |
| C20 | 16/16 ✅ | 12/12 ✅ | KMF parent | 320 |

全部 960 题（480 听力 + 480 阅读）均从 KMF 导入。

---

## 十、questionText 提取规则

### 10.1 铁律：type 字段是 STRING

KMF JSON 中所有 `type` 字段都是 **字符串**（`"680"`, `"691"` 等），不是 number。用 `=== "680"` 而非 `=== 680`。

### 10.2 questionText 的三个来源

**来源1：`children[].question.obj.content`**（绝大多数题型）

适用于 child type 101（单选）、611（多选）、405（带内容拖拽）、711（判断）。

KMF 的 `children[].question.obj.content` 直接就是题干文本：
```
child.question.obj.content = "What made David leave London and move to Northsea?"
→ questionText = "What made David leave London and move to Northsea?"
```

**来源2：`question.obj.content`（Group 级提取）** ⭐ 重要

适用于 child type 404（不带内容填空）、406（不带内容拖拽），即 KMF group type 680/686/692。

这些 child 的 `content` 为空，题干嵌入在 **group 级 `content`** 中，通过 `[blank]N[/blank]` 或 `[match]N[/match]` 标记与题号对应。

```typescript
// Group content 示例 (type 680):
"A move away from the exploration of heavily mined reserves on land is a good idea. [blank]18[/blank][br]
The negative effects of undersea exploration on local areas and their inhabitants are being ignored. [blank]19[/blank][br]"

// 提取规则：
// 1. 按 [br] 或 [br/] 分割成行
// 2. 每行如果有 [blank]N[/blank] 或 [match]N[/match]，则该行属于 QN
// 3. 清除标记符（替换为 ______），清除 BBCode/HTML
// 4. 提取的句子 = questionText

// 结果：
// Q18: "A move away from the exploration of heavily mined reserves on land is a good idea. ______"
// Q19: "The negative effects of undersea exploration on local areas and their inhabitants are being ignored. ______"
```

**注意**：type 680 的 content 可能混用 `[blank]` 和 `[match]` 两种标记，都要处理。

**来源3：多选题共享**（child type 611）

一个 KMF child（`relative_seq: ["17","18"]`）对应 DB 中多道题（Q17 和 Q18），**questionText 相同**。

导入时必须把同一个 child 的 content 写入所有对应的 DB questions。

### 10.3 提取流程完整代码

```typescript
function extractQuestionTexts(groupContent: string): Map<number, string> {
  const qTexts = new Map<number, string>();
  
  // 1. 分割行（同时处理 [br] 和 [br/]）
  const lines = groupContent
    .replace(/\[br\/\]/g, '\n')
    .replace(/\[br\]/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  
  for (const line of lines) {
    // 2. 找所有 [blank]N[/blank] 和 [match]N[/match]
    const markerRegex = /\[(blank|match)\](\d+)\[\/\1\]/g;
    const markers: {qNum: number; fullMatch: string}[] = [];
    let m;
    while ((m = markerRegex.exec(line)) !== null) {
      markers.push({ qNum: parseInt(m[2]), fullMatch: m[0] });
    }
    if (markers.length === 0) continue;
    
    // 3. 清除标记符和 BBCode/HTML
    let cleanLine = line;
    for (const mk of markers) {
      cleanLine = cleanLine.replace(mk.fullMatch, '______');
    }
    cleanLine = cleanBbcode(cleanLine); // 用 cleanKmfPassage 同款规则
    if (cleanLine && cleanLine !== '______') {
      for (const mk of markers) {
        qTexts.set(mk.qNum, cleanLine);
      }
    }
  }
  
  return qTexts;
}
```

---

## 十一、常见陷阱与错误模式

### ⚠️ 铁律0：提示句（instructions）是必须的，永远从 KMF 提取

**每次导入、每次修改数据后，必须检查 `IELTSExamSection.instructions` 是否正确。**

instructions 来自 KMF 每个 group 的 `added_content[]`，**所有 group 的提示语必须合并存入**。前端 `findMatchContext()` / `getListeningMatchHint()` 依赖这些文本渲染每个题组的提示句。

**症状**：某组题上方缺提示句（如匹配题只有选项没有 "Choose N answers..." 说明）。

**检查方法**：
```sql
-- 找出 P2/P3 有非填空题型但 instructions 还是 "Complete the notes" 的 section
SELECT s.id, s.instructions 
FROM IELTSExamSection s 
JOIN IELTSExam e ON s.examId = e.id 
WHERE e.type = 'listening' AND s.sectionIndex IN (2,3)
AND s.instructions LIKE 'Complete the notes%'
AND EXISTS (SELECT 1 FROM IELTSQuestion q WHERE q.sectionId = s.id AND q.questionType != 'fill_blank');
```

### 铁律0-1：KMF `[center][b]` 标题必须保留

KMF 的 Group content 中 `[center][b]Title[/b][/center]` 是题组的标题（如 Summary 的 "The tennis racket and how it has changed"）。导入时**必须**转为 passageText 首行的 `## Title` 格式，前端 `getSummaryGroup`（正则 `/^##\s/`）和 `SummaryCompletion` 依赖它渲染标题。

```
KMF: [center][b]The tennis racket...[/b][/center][br/]·text [blank]8[/blank]...
  ↓
DB:  "## The tennis racket and how it has changed\n\n·text (8) ______..."
  ↓
UI:  粗体标题 + 边框内的填空段落
```

**Summary 类 passageText 格式规范**：
- 第一行：`## Title`（`getSummaryGroup` 正则 `/^##\s/` 检测，`SummaryCompletion` 渲染为居中粗体标题）
- 第二行：空行或描述句（可选）
- 后续：段落文本，blank **必须用 `(N) ______` 格式**（N = 题号）。`SummaryCompletion` 用 `split(/(\(\d+\)\s*_{2,})/)` 匹配，没有 `(N)` 前缀会找不到 blank
- `getStandardHint` 检测 `raw.startsWith('##')` → 返回 "Complete the summary below." + word limit

### 铁律0-2：`extractWordLimit` 必须同时匹配 `boxes` 和 `Questions`

KMF 阅读指令写的是 `Write your answers in boxes 8–13`，**不是** `Questions 8–13`。前端 `extractWordLimit` 搜索 Q 号范围时必须同时匹配两种格式：

```typescript
// ✅ 正确
const rm = l.match(new RegExp(`(?:Questions|boxes)\\s+${qiStart}\\s*[-–]\\s*${qiEnd}`, 'i'));
// ❌ 只搜 Questions — KMF boxes 格式搜不到
```

**症状**：fill_blank 的提示语显示 TRUE/FALSE 的长文本（fallback 匹配到了 TF 指令）。

### 铁律0-3：阅读 section 的 `instructions` 格式

格式固定为：`文章正文 + "\n\n" + 所有 group 的指令（用 \n\n 连接）`。

前端 `renderPassage` 通过模式匹配（`/^Do the following statements/`, `/^Complete the/` 等）自动截断正文，后半部分用于 `getStandardHint` / `findMatchContext` 提取各组的提示语。

### ⚠️ 铁律终极：提示语提取唯一标准函数

**禁止**再用临时脚本提取提示语。以后任何涉及 KMF→DB 的导入/修复，**必须**使用以下两个标准函数：

```typescript
// ═══════════════════════════════════════════════════════
// 函数1: cleanAddedContent — 清洗 KMF added_content HTML
// 输入: result.questions[N].question.ext.added_content[M].ex_information
// 输出: 纯文本提示语，空格正确
// ═══════════════════════════════════════════════════════
function cleanAddedContent(html: string): string {
  return html
    .replace(/<\/div>\s*<div[^>]*>/gi, ' ')
    .replace(/<\/div>\s*<b>/gi, ' ')
    .replace(/<\/b>\s*<div[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════
// 函数2: buildSectionInstructions — 从 KMF JSON 构建完整 instructions
// 输入: KMF JSON 的 result 对象
// 输出: 标准格式的 instructions 字符串
// ═══════════════════════════════════════════════════════
function buildSectionInstructions(kmfResult: any): string {
  const groups = kmfResult.questions || [];
  
  // 文章正文（阅读）—— parent 的 content
  const parentContent = groups[0]?.parent?.question?.obj?.content || '';
  let instructions = '';
  
  if (parentContent.trim()) {
    // 阅读：文章 + 题目指令
    instructions = cleanKmfPassage(parentContent) + '\n\n';
  }
  
  // 所有 group 的提示语（按顺序）
  const prompts: string[] = [];
  for (const group of groups) {
    const addedContent = group.question?.ext?.added_content || [];
    for (const ac of addedContent) {
      const text = cleanAddedContent(ac.ex_information || '');
      if (text && !prompts.includes(text)) {
        prompts.push(text);
      }
    }
  }
  
  // 标准化：补 Questions、清空格逗号
  instructions += prompts.join('\n\n')
    .replace(/next to (\d+)/gi, 'next to Questions $1')
    .replace(/\s+,/g, ',');
  
  return instructions;
}
```

**铁律**：以后任何从 KMF 写入 DB `instructions` 的操作，一律调用 `buildSectionInstructions(kmfResult)`，不再手写提取逻辑。

**⚠️ KMF sheet_id 顺序 ≠ Test 顺序**：同一本书的 KMF 文件中，sheet_id 的数值大小与 Test 1-4 没有对应关系。不能按 sheet_id 排序来分配 Test 编号。必须通过文章标题（`parent.question.obj.title`）与已确认的 Test/Section 对应关系来手动映射。

```json
// C19 reading P1 (Q1-13) — sheet_id 顺序不可信：
// sheet 440 → "The Industrial Revolution in Britain" (NOT T1!)
// sheet 510 → "How tennis rackets have changed" (T1)
// 必须按标题内容确定属于哪个 Test
```

### 铁律0补充：KMF `added_content` 格式清洗规则

111：KMF 的 `<div>Choose</div><b> ONE WORD ONLY </b>` → 去标签后变成 "ChooseONE WORD ONLY"。必须在去标签前在块级元素间插入空格：`.replace(/<\/div>\s*<div[^>]*>/gi, ' ').replace(/<\/div>\s*<b>/gi, ' ').replace(/<\/b>\s*<div[^>]*>/gi, ' ')`
2. 去所有 HTML 标签：`.replace(/<[^>]+>/g, '')`
3. 合并空白：`.replace(/\s+/g, ' ').trim()`
4. 补 "Questions"：`.replace(/next to (\d+)/gi, 'next to Questions $1')`
5. 清理空格逗号：`.replace(/\s+,/g, ',')`
6. **所有 group 的提示语用 `\n` 连接**（保留顺序）

```typescript
function cleanAddedContent(html: string): string {
  return html
    .replace(/<\/div>\s*<div[^>]*>/gi, ' ')   // div→div: 加空格
    .replace(/<\/div>\s*<b>/gi, ' ')           // div→b: 加空格
    .replace(/<\/b>\s*<div[^>]*>/gi, ' ')     // b→div: 加空格
    .replace(/<[^>]+>/g, '')                   // 去所有标签
    .replace(/\s+/g, ' ')                      // 合并空白
    .trim();
}
```

---

### ⚠️ 陷阱1（屡犯！）：`type` 字段是 STRING，不是 number

```javascript
// ❌ 错误 — 已犯 3 次以上
if (cType === 101) ...      // "101" === 101 → false!
if (gType === 680) ...      // "680" === 680 → false!

// ✅ 正确
if (cType == 101) ...       // 宽松相等
if (cType === "101") ...    // 严格相等 + 字符串
if (String(cType) === "101") ...
```

KMF JSON 中所有 `type`、`business_type`、`logic_type`、`child.question.obj.type`、`group.question.obj.type` 都是**字符串**。

**防再犯措施**：任何 rebuild 脚本第一行必须写 `// ⚠️ ALL KMF type fields are STRINGS. Use == not ===`。

### 陷阱2：Group content 指纹匹配可能错配

当用 group content 中的 `[blank]N[/blank]` 提取 questionText 时，如果 DB section 中**所有题都为空**（无指纹题），则无法区分哪个 KMF sheet 对应哪个 section，可能把所有空 section 都匹配到同一个 KMF group。

**症状**：多个不同的 section（如 C20 T2P1、T3P1、T4P1）出现完全相同的 questionText（如都显示 "pollution from ______ on the river bank"）。

**修复规则**：
1. 优先用已填充的题做指纹匹配（content + answer 双重比对）
2. 指纹匹配 score 为 0 时，**跳过不修**（而非匹配第一个候选）
3. 对 table 型 section（KMF type 692 含 HTML `<table>`），questionText 应留空，内容在 passageText

### 陷阱3：填空 correctAnswer 不应有 "A. " 前缀

KMF type 404（不带内容的填空题）的 answer 直接是答案词（如 `"fish"`），**没有字母前缀**。字母前缀（`A. `, `B. `）只用于 MC 选项（child type 101/611）。

**症状**：`correctAnswer = "A. fish"` 且 `options = ["A. fish"]`。

**原因**：错误地将填空答案当成 MC 选项处理。

**修复规则**：
- fill_blank 的 `correctAnswer` = KMF `answer[0].obj.content`（直接取）
- fill_blank 的 `options` = **NULL**（填空不需要选项）

### 陷阱4：HTML Table 必须按 `<tr>` / `<td>` 解析

KMF type 692（听力图表题）的 `content` 字段中含完整 HTML `<table>`，用 `<tr>` 分行、`<td>` 分列。**禁止**简单 regex 清理 HTML 后拼接——会丢失列边界，所有数据挤进第一列。

```typescript
// ✅ 正确：用 <tr> 和 <td> 做分隔符逐格提取
const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
let pipeTable = '[table] Title\n';  // 无 ## 前缀！

for (const tr of trs) {
  const tds = tr.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
  const cells = tds.map(td =>
    td.replace(/<input[^>]*>/g, '______')  // KMF input → blank
       .replace(/<[^>]+>/g, '')            // 去所有 HTML 标签
       .replace(/&nbsp;/g, ' ')
       .replace(/\s+/g, ' ').trim()
  );
  pipeTable += '| ' + cells.join(' | ') + ' |\n';
}
```

**关键**：`<input>` 标签所在位置 = 填空位置，转为 `______`。其他 HTML 标签全部去除，保留纯文本。KMF 就是通过 `<tr>`/`<td>` 这些"特殊字符串"来分割表格内容的。

### 陷阱7：passageText 标记符不能有 `##` 前缀

`[table]`、`[note]`、`[form]`、`[flowchart]` 这些标记符**本身就是第一行开头**，前端通过 `startsWith('[table]')` 等精确匹配检测。**前面不能再加 `## `**。

```
❌ "## [table] Restaurant Recommendations\n| ..."   → 检测失败
✅ "[table] Restaurant Recommendations\n| ..."       → 正确

❌ "## [note]\n..."   → 检测失败
✅ "[note]\n..."       → 正确
```

**仅 summary 或普通标题用 `## Title` 格式**（无标记符的纯文本标题）。这是 FillBlank 组件边框模式用的：
```
✅ "## Urban farming in Paris\n\nVertical tubes..."  → FillBlank 框模式
```

### 陷阱8：questionText 中 `[b]` 必须转为 `**`，前端用 RichText 渲染

KMF 的 `[b]...[/b]` 标记表示加粗。导入时必须转为 `**...**`（Markdown 粗体语法）。前端 `SingleChoice`、`MultiChoiceGroup`、`TrueFalse` 组件使用 `<RichText>` 渲染 questionText，会自动将 `**text**` 转为 `<strong>text</strong>`。

```
KMF: "Which [b] TWO [/b] things..."
  ↓ 清洗
DB:  "Which ** TWO ** things..."
  ↓ RichText 渲染
UI:  "Which <strong>TWO</strong> things..."
```

**注意**：这些组件的 questionText 段落**不加 `font-bold`**，粗体完全由 `**...**` 标记控制。如果发现 questionText 中还有原始 `[b]` 标签，说明导入时未执行 BBCode 清洗。

**规范化规则**：
1. `[b] TEXT [/b]` → `**TEXT**`（去多余空格，保留一个空格）
2. 不可出现 `** **`（双粗体嵌套）或 `****`，统一为 `**TEXT**`
3. 导入时直接 `.replace(/\[b\]\s*/gi, '**').replace(/\s*\[\/b\]/gi, '**')` 再加后处理去重
4. 如果 questionText 已有 `** TEXT **`（带空格），不影响 RichText 渲染，但最好规范为 `**TEXT**`

### 陷阱9：听力 P4 `[note]` 的标题和子标题来自 KMF BBCode

KMF 听力 P4（type 692）的 `content` 中，标题通过 BBCode 标记区分：

```
[center][b]Reclaiming urban rivers[/b][/center]  ← 主标题 → "## Title"
[b]Historical background[/b]                      ← 子标题 → "## SubTitle"
● bullet point with [blank]N[/blank]              ← 正文 + {Q(N+30)}
```

**提取规则**：
1. `[center][b]...[/b][/center]` → `## Title`（NoteModeGroup 自动居中加粗大字）
2. `[b]...[/b]` 独立的短行（≤10词，无句号）→ `## SubTitle`（加粗小字）
3. `●` / `○` 开头 → 正文行
4. `[blank]N[/blank]` → `{Q(N+30)}`（P4 的 Q 号偏移 **+30**）

### 陷阱10：用 KMF content 判断 `[table]` vs `[note]`，不能看 instructions

instructions 可能写 "Complete the table below" 但 KMF content 实际上是 note bullet 格式（无 HTML `<table>`）。判断依据：

```typescript
const hasHtmlTable = /<table/i.test(kmfContent);
const marker = hasHtmlTable ? '[table]' : '[note]';
```

**症状**：`[table]` 标记 + 无管道 `|` 行 → TableGroup 解析失败，页面空白。

**修复**：用 KMF `content` 中是否含 `<table>` 标签为准，instructions 仅作参考。

### 陷阱11：匹配题 options 必须全组共享 Group 级 answer[]

匹配题（KMF type 694/683/684/685/680）的选项列表在 **Group 级 `answer[]`**，不是每个 child 独有。所有同组 child 必须共享同一个 options JSON 数组。

```
❌ child 1: options = ["A选项内容"]      // 只有自己的答案
   child 2: options = ["B选项内容"]      // 不同！MatchingGroup 无法渲染
✅ child 1: options = ["A选项内容","B选项内容","C选项内容",...]  // 全组共享
   child 2: options = ["A选项内容","B选项内容","C选项内容",...]  // 完全相同
```

**症状**：拖拽面板只显示 1 个选项，或者匹配题整组不显示。

**原因**：错误地从 `children[].answer[0].obj.content` 提取选项，而非从 `group.answer[]`。

**正确提取**：
```typescript
// Group 级 answer[] → 共享选项列表
const sharedOptions = group.answer.map(a => a.obj.content);

// Child 的 choice 字母 → 映射到正确选项文本
const childLetter = child.answer[0].ext.choice[0].ex_information.toUpperCase();
const correctAnswer = group.answer.find(a => a.ext.choice[0].ex_information === childLetter)?.obj.content;
```

### 陷阱12：听力 P2/P3 多 group 的 instructions 必须合并

一个听力 P2/P3 的 KMF sheet 包含**多个 group**（如 matching + MC），每个 group 有自己的 `added_content` 提示语。**所有 group 的提示语都要合并存入 section instructions**，用换行分隔。前端 `findGroupHint()` 会自动为每个 group 匹配对应的提示句。

```
KMF group 1 added_content: "What is the role of the volunteers in each of the following activities?..."
KMF group 2 added_content: "Choose the correct letter, A, B or C."
  ↓ 合并
Section instructions: "What is the role of the volunteers...\nChoose the correct letter..."
```

**症状**：匹配组上方缺提示句，或整个 section 只有 MC 的提示而没有匹配的提示。

**额外格式要求**：前端 `getListeningMatchHint` 正则有两个硬性要求：
1. Q 号前必须有 **"Questions"** 字样（`next to Questions 11-16` ✅，`next to 11-16` ❌）。KMF 原文通常缺 "Questions"，导入时需补上
2. 字母范围后逗号前不能有空格（`A-I,` ✅，`A-I ,` ❌）。KMF HTML 清洗后可能残留多余空格，需 `replace(/\s+,/g, ',')` 清理

```typescript
// 导入时的标准化处理
instructions = instructions
  .replace(/next to (\d+)/gi, 'next to Questions $1')  // 补 "Questions"
  .replace(/\s+,/g, ',');  // 清理 "A-I ," → "A-I,"
```

### 陷阱15：一个 section 可有多个 `[table]` 组，需按 marker 位置分界

C19 T4P1 含两个独立的 `[table]`（Q1-Q6 和 Q7-Q10）。分组时必须用**下一个 `[table]` 的位置**作为前一组的截止边界，不能简单用 `start + 10` 全覆盖。

```
❌ Q1 的表组包含 Q1-Q10 → Q7 的表被跳过
✅ Q1 的表组截止于 Q7 的 [table] 前 → Q1-Q6，Q7 独立成组 Q7-Q10
```

**修复**：`getTableGroups` 先收集所有 `[table]` 起始 index，每组截止于下一个 `[table]` 或 `start + 10`（取较小值）。

### 陷阱16：无表头的 label-value 表格

当表格第一行就包含 `______`（如 `| Name of supervisor: | ______ |`），这不是表头而是数据行。若当 `<thead>` 渲染，第一个 blank 就丢失了。

**检测**：`parseTable` 检查首行是否有 `______`（`hasBlank()`）→ 整表无 `<thead>`，全部按 `<tbody>` 渲染。



### 铁律终极-补充：`cleanQuestionText` 和 rebuild 后验证

**任何 rebuild 操作后，必须对所有 questionText 调用 `cleanQuestionText()`，并全库扫描 `[match]`、`[blank]` 残留。**

```typescript
function cleanQuestionText(raw: string): string {
  return raw
    .replace(/\[match\]\d+\[\/match\]/gi, '')
    .replace(/\[blank\]\d+\[\/blank\]/gi, '______')
    .replace(/\[b\]/gi, '**').replace(/\[\/b\]/gi, '**')
    .replace(/\[br\/?\]/gi, ' ')
    .replace(/\[\/?(?:center|h\d|strong|insert:\d+|img)\]/gi, '')
    .replace(/&nbsp;/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ').trim();
}

// ⚠️ 铁律：● 和 ○ 之前必须确保换行（KMF 的 [br] 被清掉后可能丢失）
function bulletsOnNewLines(text: string): string {
  return text
    .replace(/([^\n])([●○])/g, '$1\n$2')
    .replace(/\n{3,}/g, '\n\n');
}
```

**杜绝方案**：rebuild 脚本完成后立即跑 `scan-all-br.ts` + `clean-all-br.ts` 验证。禁止"修A坏B"——修一个 section 时不能把已清洗过的 BBCode 重新带回。
### 陷阱21：KMF type 711（判断题）的 practice data 不可靠

KMF practice API 返回的数据中，type 711（判断题）的 `children[].answer[0].obj.content` 存储的是**用户作答**，不是正确答案。当 `ext.correct[]` 不含 "correct" 时，该答案为错误作答，不可写入 DB。只有 `correct=True` 时答案才可信。

**症状**：判断题全部答案变成同一个值（如全 YES）。

**规避**：判断题优先保留 DB 现有答案，仅在 KMF `correct=True` 时更新。或找非 practice 数据源。

### 陷阱22：KMF 目录中的重复文件会导致 test 分配偏移

C19 `c19/` 目录中 sheet 378 和 386 各出现两次。按 sheet_id 排序分配 test 时，重复文件会多占一个 test 槽位，导致后续 section 全部错位（如 T4P2 拿到了 T3P2 的数据）。

**修复**：加载 KMF 文件时先 `Set<sheetId>` 去重。

### 陷阱23（2026-06-28）：KMF flat file 命名不含模块（听阅混淆）⚠️ 严重

旧命名 `c18_t1p1.json` 无法区分听力还是阅读。C18 T1 的 flat files 存的是听力数据，但被当成阅读数据导入，导致：
- C18 T1 R P1 正文消失（instructions 只剩73字符的听力提示语）
- C18 T1 R P2 题目 options 全是听力数据
- C18 T1 R P3 选项也错乱

**修复**：
1. 全部 flat file 改名为 `c{book}_{module}_t{test}p{part}.json`（module = `listening` | `reading`）
2. 使用任何 flat file 前，先检查 `result.result.subject`（1=阅读/2=听力）确认模块
3. 阅读数据优先从 `c{book}-reading/` 子目录获取，再用 `c{book}_reading_*.json` flat file

**铁律**：永远不要从文件名推断模块。优先检查 JSON 内 `subject` / `mode` 字段。

### 陷阱24（2026-06-28）：getSummaryGroup 覆盖 table 题

前端 `getSummaryGroup` 从第一个 `## ` passageText 开始，收集**所有**后续 fill_blank 题，包括属于 `[table]` 的题。导致 table 题被 summary 渲染吃掉，页面只有 summary 没有 table。

**症状**：同一个 section 内 summary 后面有 table，但 table 不显示（被 summary 覆盖）。

**修复**：`getSummaryGroup` 遇 `[table]` marker 或非 fill_blank 题型时停止收集。

```typescript
// ✅ getSummaryGroup 加边界检测
for (const q of qs) {
  if (q.questionIndex <= start) continue;
  if (q.passageText?.trim().startsWith('[table]')) { end = q.questionIndex; break; }
  if (q.questionType !== 'fill_blank') { end = q.questionIndex; break; }
}
const group = qs.filter(q => q.questionIndex >= start && q.questionIndex < end && q.questionType === 'fill_blank');
```

### 陷阱25（2026-06-28）：renderPassage 误判 "A tree" 为段落标记

前端 `renderPassage` 的内联标记正则 `/^([A-Z])\s+(.+)$/` 会把 `A tree's value` 这种句首冠词 "A" 误判为段落标记 A。条件 `bodyLen >= 30` 不足以过滤，因为后续正文可能很长。

**症状**：阅读文章中出现多余的粗体大写字母 "A"，把冠词当成段落标记渲染。

**修复**：字母后紧跟小写字母 → 是冠词/代词，不是段落标记。

```typescript
// ✅ 字母后紧跟小写 = 冠词或代词，不匹配段落标记
if (inline && /^[a-z]/.test(inline[2]!)) { textBuf.push(lines[li]!); continue; }
```

### 陷阱26（2026-06-28）：fill_blank 选项污染 — 同 section 匹配组选项泄漏到填空题

一个 section 内有多个 group（fill_blank + matching），rebuild 时如果不按 group 边界处理，匹配组的 `answer[]` 选项列表可能泄漏到相邻的 fill_blank 题。

**症状**：fill_blank 题的 `options` 字段不是 NULL，而是人名/短语列表（实际属于同一 section 的匹配组）。

**修复**：
1. 每个 group 单独处理，**严格按 group 类型分派** options
2. fill_blank（KMF child type 404/403）的 `options` 永远设为 NULL
3. Rebuild 后用 SQL 检查：`SELECT * FROM IELTSQuestion WHERE questionType='fill_blank' AND options IS NOT NULL AND options != '[]'`

### 陷阱27（2026-06-28）：阅读 section 数据源确认链路

C18 T1 阅读的三个 KMF reading 文件来自 `c18-reading/` 子目录（sheet_id 连续的三文件），**不是** flat files。flat files `c18_t1p1~3.json` 是听力数据。

**数据源确认方法**：
1. 先查 `kmf-data/{book}-reading/` 子目录，找 Q 号范围匹配的 sheet
2. 用 `result.result.subject === 1` 或 `mode === 18` 确认是阅读
3. 用 `parent.question.obj.content` 的标题与已知文章标题对照
4. 只有在子目录找不到时，才尝试 flat file（且必须验证 subject/mode）

**典型症状**：DB section 的 instructions 长度异常短（如 73 字符、只有一句听力提示语），说明被听力数据覆盖。

### 陷阱28（2026-06-28）：● ○ bullet 换行丢失

KMF 用 `[br][br]● text` 来分隔 bullet。`cleanQuestionText` 把 `[br]` 替换为空格后，bullet 可能粘在前一行末尾。`cleanKmfPassage` 把 `[br]` 替换为 `\n` 但如有额外清洗可能丢失换行。

**症状**：bullet 列表项和上一行文字连在一起，没有换行。

**修复**：在最终的 passageText / questionText 上调用 `bulletsOnNewLines()`：
```typescript
function bulletsOnNewLines(text: string): string {
  return text.replace(/([^\n])([●○])/g, '$1\n$2').replace(/\n{3,}/g, '\n\n');
}
```

### 陷阱20：人名匹配提示语用标准字母 A/B/C/D，不用人名首字母

`getPersonMatchHint` 生成 "Match each statement with the correct person, A, B, C or D." 时，字母来自标准序列 `ABCDEFGHIJKLMNOPQRSTUVWXYZ`（按选项数量取），**不能**用 `options.map(o => o[0])` 取人名首字母。

```
❌ options = ["Anna", "Markus", "Chris", "Felix"] → "C, M, A or F"
✅ 按选项数量取标准字母 → "A, B, C or D"
```

### 陷阱19：同一 section 多个匹配组时，禁止跨组混淆数据

一个阅读 section 可含多个匹配组（如 C18 T3P1：Q1-4 段落匹配 + Q9-13 人名匹配）。重建时必须按 KMF group 逐个处理，**禁止**用 Q 号范围批量覆盖。

段落匹配（684）→ options 是字母 A-H，人名匹配（683）→ options 是人名列表。两者互换会导致选项全错。

```typescript
// ✅ 正确：按 KMF group 逐个重建
for (const group of kmfData.questions) {
  if (gType === '684') {
    options = groupAnswers.map(a => a.letter);  // 字母
  } else if (gType === '683') {
    options = groupAnswers.map(a => a.content); // 人名
  }
  // ... 按 child 逐个更新
}
```

### 陷阱18：`[br]` 和 `[br/]` 是两种不同标记，都必须清理

KMF 同时使用 `[br]` 和 `[br/]` 两种换行标记。`cleanKmfPassage` 必须两种都处理，且先处理双换行 `[br][br]` / `[br/][br/]` → `\n\n`，再处理单换行。

```typescript
// ⚠️ 必须同时处理两种
.replace(/\[br\]\s*\[br\]/gi, '\n\n')   // [br][br]
.replace(/\[br\/\]\s*\[br\/\]/gi, '\n\n') // [br/][br/]
.replace(/\[br\]/gi, '\n')                // 单 [br]
.replace(/\[br\/\]/gi, '\n')              // 单 [br/]
```

**症状**：passageText 或 questionText 中残留 `[br]` 文字，UI 显示原始 BBCode。

### 陷阱17：表格 title 行（colspan 合并单元格）和同格多 blank 换行

KMF HTML table 第一行常用 `colspan` 合并所有列做标题（如 `| First day at work |`）。`parseTable` 检测首行仅 1 个非空 cell → 识别为 title，独立渲染为居中加粗行。

同一 cell 内有多个 `______`（如 `to give ______ number to collect ______`），TableGroup 渲染时第二个及后续 blank 前加 `<br/>` 换行。

### 陷阱14：`[table]` 用 `______`，`[note]` 用 `{QN}`，不可混用

两个组件搜索 blank 的方式不同：

| 标记 | 组件 | blank 格式 | 检测方式 |
|------|------|-----------|---------|
| `[table]` | TableGroup | `______` | `hasBlank()` 正则 `/{2,}/` |
| `[note]` | NoteModeGroup | `{Q31}` | `/\{Q\d+\}/` 正则 |

**症状**：table 里出现 `{Q1}` 文字但没输入框；note 里出现 `______` 文字但没输入框。

**原因**：格式用错了组件不识别。

**规则**：从 KMF HTML `<table>` 重建的 passageText 用 `______`；从 KMF BBCode `[blank]N[/blank]` 重建的用 `{QN}`。

### 陷阱5：多 section 共占同一 Q 号范围

KMF 中多个 book/test 的 section 可能有相同的 Q 号范围（如所有 P1 都是 Q1-10）。匹配时必须用 **book + type + Q号** 三重索引，不能仅用 Q 号。

```typescript
// ❌ 单靠 Q 号匹配 — 会跨书错配
const key = `${qNum}`;

// ✅ 三重索引
const key = `${book}|${type}|${qNum}`;  // "18|listening|12"
```

### 陷阱6：同一个 sheet 内多个 group 的 seq 重复

KMF 同一个 sheet 内可能有多个 group（不同题型组），它们的 children 可能有相同的 Q 号（因为每个 group 独立计数）。去重时保留 content 最长的那个。

---

## 十二、音频

```
https://yxzm-audio.oss-cn-beijing.aliyuncs.com/Cambridge-IELTS-{book}/T{test}/S{section}.mp3
```
