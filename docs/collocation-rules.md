# Collocation（常用搭配/短语）规则文档

> **唯一真相源。** 区分单词和短语，管理 Collocation 表与 WordAnnotation 表的边界。

---

## 一、单词 vs 短语：判断规则

### 属于 WordAnnotation（单词）

| 条件 | 例子 |
|------|------|
| 单个词，无空格、无连字符 | `out`, `sight`, `break`, `nature` |
| 连字符复合词（已固化为一个单词） | `well-known`, `x-ray`, `father-in-law`, `eco-friendly`, `up-to-date` |
| 缩写/首字母缩略词 | `USA`, `HIV`, `OK` |

### 属于 Collocation（短语/搭配）

| 条件 | 例子 |
|------|------|
| 含空格的多词组合 | `out of sight`, `carry out`, `focus on`, `raw material` |
| 动词短语（phrasal verb） | `account for`, `abide by`, `adapt to` |
| 介词短语 | `ahead of`, `in front of`, `due to` |
| 固定搭配/习语 | `above all`, `after all`, `per cent` |
| 含空格的专有名词 | `el nino`, `solar system`, `carbon dioxide` |
| 动词短语的过去式（一种特殊 Collocation） | `accounted for`（是 `account for` 的过去式形式） |

### 不属于两者（应清理）

| 条件 | 例子 | 处理 |
|------|------|------|
| 词缀/前后缀 | `ab-`, `re-`, `un-`, `-tion` | 不存（词缀不是独立词条） |
| "sb" / "sth" 占位短语 | `accuse sb of`, `remind sb of` | 去掉 sb/sth 后存为 Collocation：`accuse of`, `remind of` |

---

## 二、Collocation 数据模型

```
Collocation {
  id           Int
  phrase       String        // "out of sight"
  translation  String        // "看不见；消失"
  examplesJson String?       // 例句 JSON
}

CollocationWord {
  id             Int
  collocationId  Int         // → Collocation
  word           String      // 组件单词，如 "out", "sight"（小写）
  wordAnnotationId Int?      // → WordAnnotation（可选：如果该单词有注解）
}
```

**核心**：CollocationWord 存组件单词的**原始形**（小写），用于查询匹配。查词时通过 `WHERE cw.word = ?` 找到包含该单词的所有搭配。

---

## 三、迁移规则（WordAnnotation → Collocation）

### 迁移步骤

1. 识别 WordAnnotation 中的所有多词条目（`word LIKE "% %"`）
2. 对每条：
   - 提取组件单词：`phrase.split(' ')`，去停用词（a, an, the, of, to, for, in, on, at, by）
   - 创建 Collocation，translation 取原值
   - 对每个组件单词，创建 CollocationWord
   - 删除原 WordAnnotation（先清理引用：nounId/verbId/adjId/advId/pastTenseId/pastParticipleId 指向它的，以及 WordAnnotationTag、UserVocabulary、VocabularyWord 关联）
3. 对于动词短语的过去式（如 `accounted for`），Collocation 关联到原形短语的组件单词（"account" + "for"），不关联 "accounted"

### 不需要迁移的

- 连字符复合词（`well-known`, `x-ray` 等）→ 保留在 WordAnnotation
- 词缀（`ab-`, `re-` 等）→ 直接删除（不是词条）
- 单单词条目 → 保留不动

---

## 四、API 查询规则

### 查词时附带查询搭配

```typescript
const collocationRows = await prisma.collocationWord.findMany({
  where: { word },  // word 是用户查询的单词（已小写）
  include: { collocation: { select: { phrase: true, translation: true } } },
});
```

因为 CollocationWord.word 存的是组件单词原形（小写），查询时只需要匹配小写后的单词。

### AI 富集不处理搭配

`ai.service.ts` 的 `annotateWord()` 只生成单词的发音、词性、翻译、例句、词形变化。搭配数据独立管理，由人工或批量导入（如 Academic Collocation List）。

---

## 五、前端展示规则

WordPopup 中：
1. 词形变化（forms）→ 词形变化 section（已有）
2. **Collocations** → 常用搭配 section（新增）
3. 例句 → 例句 section（已有）

展示格式：`phrase — translation`，如 `out of sight — 看不见；消失`

---

## 六、维护规则

- 新增搭配：直接写入 Collocation + CollocationWord
- 删除搭配：先删 CollocationWord，再删 Collocation
- 搭配的 AI 生成：暂不支持，人工录入或从词表（如 PTE Collocation List）批量导入
