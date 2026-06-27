# IELTS 完整参考文档

> **唯一真相源。** 解析题目、生成数据、写前端代码时，必须按照本文档的格式。

---

## 一、核心规则

### 数据来源铁律
所有 IELTS 题目数据，**永远必须以 KMF（考满分）API 为准**，禁止自己猜测、编造或从记忆补充。
- 有 KMF → 从 KMF API 抓取（详见 [[kmf-data-guide]]）
- 没有 KMF → 问用户要，或留空
- 不确定 → 问用户
- 永远不猜
- **PDF 仅作参考，不再作为数据源。**

### 导入标准流程
每次从 KMF 导入 IELTS 题目时的强制步骤：
1. **先读本文档 + kmf-data-guide** — 获取最新题型格式和 KMF 解析规则
2. **从 KMF API 获取数据** — `practise-detail?u=...` 接口，存 `kmf-data/` 目录
3. **按题型解析** — 填空(HTML→passageText)、匹配(Group级answer[])、MC(children.answer[])
4. **写入数据库** — 逐题 update，导出种子 SQL

---

## 二、数据库字段

### IELTSQuestion
| 字段 | 类型 | 用途 |
|------|------|------|
| `questionType` | String(30) | `fill_blank` / `multiple_choice` / `matching` / `true_false` / `yes_no` / `map_labelling` |
| `questionText` | Text? | 题目文本，空白用 `______` 或 `...` 标记 |
| `passageText` | LongText? | 特殊布局标记 |
| `options` | Text? | JSON 数组，如 `'["A. xx","B. xx"]'` |
| `correctAnswer` | Text | 正确答案 |

### Section.instructions 格式
必须包含**两行**：
1. 题型描述（如 `Complete the form below.`）
2. 字数限制（如 `Write ONE WORD AND/OR A NUMBER for each answer.`）

可选第三行起：`## Q31 Sub-heading` 格式的子标题，由 `headingMap` 解析。

---

## 三、标记符汇总

| 标记 | 位置 | 用途 |
|------|------|------|
| `[note]` | passageText | 笔记模式（NoteModeGroup） |
| `[form] Title` | passageText | 表单模式（FormFillBlank） |
| `[table]` | passageText | 表格模式（TableGroup） |
| `[flowchart]` | passageText | 流程图拖拽匹配（FlowchartMatching） |
| `## Title` | passageText | 边框模式 / Summary / NoteGroup 子标题 |
| `## Q31 Title` | instructions | headingMap 子标题 |
| `#sub Title` | passageText | 表单子标题（FormFillBlank 模式2） |
| `{Q31}` | passageText | Note 模式中的填空占位 |

### 格式统一规则
- **所有 P4** 必须使用 `[note]` 格式
- **P1** 非表格的用 `[note]`，表格的用 `[table]`，表单的用 `[form]`

---

## 四、题型详解

### 1. fill_blank — 填空

| 子类型 | 触发条件 | 前端组件 | passageText 格式 |
|--------|----------|----------|-----------------|
| 普通填空 | 默认 | FillBlank | 空 或 `## BoxTitle` |
| 表单填空 | 首题含 `[form] Title` | FormFillBlank | `[form] Transport survey` |
| 表格填空 | 首题含 `[table]` | TableGroup | `[table] Title\n\| H1 \| H2 \|\n\| a \| b \|` |
| Summary填空 | 首题含 `## Title` | SummaryCompletion | `## Title\n\n段落文本 (Q1)______` |
| 笔记填空 | 首题含 `[note]` | NoteModeGroup | `[note]\n## Title\n文本 {Q31} 填空` |

**铁律**: 所有填空类型百分百必须有字数限制提示。从 instructions 提取，数字/字母部分加粗。

**instructions 示例**:
- 听力 P1：`Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.`
- 听力 P4：`Complete the notes below.\nWrite ONE WORD ONLY for each answer.`
- 阅读：`Complete the summary below.\nChoose ONE WORD from the passage for each answer.`

#### 表单填空 (FormFillBlank) 两种模式

**模式 1：标准表单**（无 `#sub`）：
- `questionText` 按冒号分栏，左侧右对齐加粗宽45%，右侧左对齐输入框前有题号
- 连续多题左侧标签相同时合并为一行

**模式 2：子标题表单**（有 `#sub`）：
- `passageText` 用 `#sub Title` 标记子标题
- 左侧子标题右对齐加粗宽40%，右侧题目堆叠
- Q1 的第一个子标题写在第二行：`[form] Main Title\n#sub First SubTitle`

#### 拖拽匹配布局 (MatchingGroup)
- 左侧条目不拉满全宽，右侧可拖拽区紧贴在条目右侧
- gap 适中（gap-6），不拉伸

### 2. multiple_choice — 单选/多选
- `options`: `'["A. xxx","B. xxx","C. xxx"]'`
- `correctAnswer`: 完整选项文本如 `"C. xxx"`
- 单选: `SingleChoice`，多选(Choose TWO): `MultiChoiceGroup`
- 提示语: `Choose **TWO** letters, **A-E**.` 加粗数字和字母范围

### 3. matching — 拖拽匹配
- `questionText`: 左侧条目文字
- `options`: 右侧可拖拽选项数组
- 连续 2+ 题 options 相同自动分组 → `MatchingGroup`
- 提示语两种格式: "Choose from box" 和 "Write the correct letter"
- `## Q15` 开头 = stem question，渲染在匹配区上方

**匹配题 instructions 格式规范**（避免重复标题 + 确保加粗）：

```
Questions 25-30
What comment do the students make about each of the following jobs?
Choose SIX answers from the box and write the correct letter, A-G, next to Questions 25-30.
```

规则：
1. 第一行 `Questions X-Y` 单独一行 → 前端渲染为粗体标题
2. 第二行 stem question（可选）→ 渲染在匹配区上方
3. 第三行 `Choose N answers from the box and write the correct letter, A-Z, next to Questions X-Y.`
   - 必须用 `write`（不用 `drag`），以便 `getListeningMatchHint` 正则匹配
   - `N`（数字）和 `A-Z`（字母范围）和 `X-Y`（题号范围）自动加粗
4. 不要在第一行后再重复 "Questions X-Y"，否则标题会显示两次

### 3b. flowchart — 流程拖拽匹配
- 首题 `passageText` 以 `[flowchart]` 开头
- 组件: `FlowchartMatching`
- 步骤用 `## Step` 分隔，填空用 `{Q26}` 标记
- 每步渲染为黑色边框圆角框，粗向下箭头连接

### 4. true_false / yes_no — 判断
- `correctAnswer`: `TRUE`/`FALSE`/`NOT GIVEN` 或 `YES`/`NO`/`NOT GIVEN`
- 组件: `TrueFalse`

### 5. map_labelling — 地图标注
- `options`: 字母数组 `'["A","B",...]'`
- `correctAnswer`: 单个字母
- 需配套图片 `IELTSExamSection.imageUrl`
- **当前状态**: 前端无专用组件，需开发

### 题型识别经验规则
| 选项数 | 大概率题型 |
|--------|-----------|
| 3 个 | 单选 (multiple_choice) |
| 5 个 | 多选 (multiple_choice) |
| 6+ 个 | 匹配 (matching) |
| 3-5 个 | 也可能是匹配 |

---

## 五、标准提示语模板

### TRUE/FALSE/NOT GIVEN
```
Do the following statements agree with the information given in Reading Passage X?
In boxes X-Y on your answer sheet, write TRUE / FALSE / NOT GIVEN.
```

### YES/NO/NOT GIVEN
```
Do the following statements agree with the claims of the writer in Reading Passage X?
In boxes X-Y on your answer sheet, write YES / NO / NOT GIVEN.
```

### Complete the notes/summary (听力)
```
Complete the [type] below.
Write **ONE WORD ONLY** for each answer.
```

### Complete the notes/summary (阅读)
```
Complete the [type] below.
Choose **ONE WORD ONLY** from the passage for each answer.
```

字数限制变体: `ONE WORD ONLY` / `ONE WORD AND/OR A NUMBER` / `NO MORE THAN TWO WORDS` / `ONE WORD`

### Multiple choice
```
Choose **TWO** letters, **A-E**.
```

### Matching
```
Choose **FOUR** answers from the box and write the correct letter, **A-F**, next to Questions **25-28**.
```

---

## 六、答题区渲染规则

### 布局结构
右侧答题区不展示 Section 标题，直接开始题目。顺序:
1. **Questions X-Y** — 粗体标题
2. **提示语句** — 题型说明
3. **题目** — 实际题目

### 提示语提取 (findGroupHint)
1. 匹配 "Questions X-Y" 行
2. 同行冒号后的文字 → hint 开头
3. 收集后续行直到空行或编号题目

### 前端渲染优先级 (QuestionsPanel)
1. Note → NoteGroup
2. Matching → MatchingGroup
3. Multi-choice → MultiChoiceGroup
4. Summary → SummaryCompletion
5. Table → TableGroup
6. Sequential → FormFillBlank 或逐个 FillBlank
7. 独立题 → QuestionBlock

---

## 七、阅读文章渲染规则

### 段落标记字母
- 独立字母 [A-Z] → 段落标记
- 内联标记 `[A-Z] + 空格 + 正文`（正文 ≥ 30 字符）→ 段落标记
- 排除: 相邻行连续独立字母（列表项）、正文 < 30 字符（短列表）
- 样式: `font-bold text-lg`，标记单独成行

### 标题与副标题
- 第一个文本块第一行 → 标题 (bold)
- 第一块后续行词数 ≤ 25 → 副标题 (italic)
- 词数 > 25 → 正文

### 换行与段落
- `\n\n` → 真实段落分隔
- 单 `\n` → PDF 自动换行，合并为空格
- 后处理: 前一段不以 `.?!` 结尾 → 合并到下一段

---

## 八、数据提取流水线

```
KMF API → kmf-data/*.json → import scripts → DB → export-seeds.ts → .sql
```

详细流程见 [[kmf-data-guide]]。

### 提取脚本核心逻辑
1. 从 KMF API 获取 `practise-detail` JSON，存入 `kmf-data/`
2. 解析 `result.questions[]`：提取文章正文(parent)、题型(type_cn)、选项(answer[])、指令(added_content)
3. BBCode 清洗（见 kmf-data-guide 第三节）
4. 写入数据库并导出 SQL 种子

### 不再使用 PDF
PDF 文件仅作人工参考，所有数据直接从 KMF API 获取。

---

## 九、前端实现

### 组件文件（听阅分离，防止互相影响）

```
SharedComponents.tsx       — 共用：BlankInput, FillBlank, SingleChoice, MultiChoiceGroup, MatchingGroup, TableGroup
ListeningComponents.tsx    — 听力：FormFillBlank, FlowchartMatching, NoteModeGroup, MapLabelling
ReadingComponents.tsx      — 阅读：SummaryCompletion, TrueFalse
Components.tsx             — barrel 重新导出（兼容旧导入）
QuestionsPanel.tsx         — 题目面板主逻辑
```
- 修改听力组件只动 `ListeningComponents.tsx`，不影响阅读
- 修改阅读组件只动 `ReadingComponents.tsx`，不影响听力
- 共用部分动 `SharedComponents.tsx`，两边同时生效

### 地图标注题 (map_labelling)
- 组件：`MapLabelling`，位于 `ListeningComponents.tsx`
- 渲染：左图（40%宽度）+ 右 MatchingGroup（拖拽字母到地点）
- 图片来自 `IELTSExamSection.imageUrl`，由 MapLabelling 内部渲染（非页面级）
- 检测：`getMapGroups()` 按 `questionType === 'map_labelling'` + 相同 options 分组
- 注意：听力页面 `listening/[id]/page.tsx` 的题目区域需 `overflow-y-auto`（不可 `overflow-hidden`），否则地图页无法滚动

### 关键函数
- `extractWordLimit()` — 从 instructions 提取字数限制
- `getStandardHint()` — 根据 passageText 前缀生成标准提示
- `getNoteGroup()` — 检测 `[note]` 标记
- `findGroupHint()` — 从 instructions 提取提示语
- `getSequentialGroups()` — 连续同类型题分组

### 全英文界面
所有考试相关页面必须是全英文（按钮、状态、弹窗、结果页等）。

---

## 十、当前支持状态

| questionType | 支持 | 组件 |
|---|---|---|
| `fill_blank` | ✅ | FillBlank / FormFillBlank / TableGroup / SummaryCompletion / NoteModeGroup |
| `multiple_choice` | ✅ | SingleChoice / MultiChoiceGroup |
| `matching` | ✅ | MatchingGroup / FlowchartMatching |
| `true_false` | ✅ | TrueFalse |
| `yes_no` | ⚠️ | 可复用 TrueFalse（需支持 YES/NO 标签切换） |
| `map_labelling` | ❌ | 需开发：图片 + 字母选择 |
