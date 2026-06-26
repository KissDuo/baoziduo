# AI 单词富集规则

## 必须查询和存储的字段

任何通过 AI 查询数据库中没有的新单词时，以下字段**默认必须查询并存储**：

### 基础字段
- `phoneticUk` — 英式音标
- `phoneticUs` — 美式音标
- `partOfSpeech` — 词性
- `translation` — 中文释义
- `examples` — 3 个中英文例句

### 变形字段（forms）
- `noun` — 名词形式，无则 null
- `verb` — 动词形式，无则 null
- `adj` — 形容词形式，无则 null
- `adv` — 副词形式，无则 null
- `pastTense` — 过去式（动词），无则 null
- `pastParticiple` — 过去分词（动词），无则 null
- `thirdPerson` — 第三人称单数（动词），无则 null
- `plural` — 复数形式（名词），无则 null

## 存储规则

| 字段 | 存储位置 | 类型 |
|------|---------|------|
| nounId/verbId/adjId/advId/pastTenseId/pastParticipleId | WordAnnotation 自引用 | Int |
| thirdPersonSingular | WordAnnotation | String |
| plural | WordAnnotation | String |

名词/动词/形容词/副词/过去式/过去分词 → 新建独立 WordAnnotation（不入词库）→ 关联 ID。
三单/复数 → 直接写字符串。

## 新增变形词处理
1. 查变形词是否已在 `WordAnnotation` 中存在
2. 不存在 → 新建 `WordAnnotation` + 打标签 + 调用 AI 生成完整词条
3. 存在 → 直接用 ID 关联
4. 新增的变形词只入 `WordAnnotation` + `WordAnnotationTag`，不加入 `VocabularyBook`

## AI Prompt 格式

```json
{
  "phoneticUk": "...",
  "phoneticUs": "...",
  "partOfSpeech": "...",
  "translation": "...",
  "examples": [...],
  "forms": {
    "noun": "... or null",
    "verb": "... or null",
    "adj": "... or null",
    "adv": "... or null",
    "pastTense": "... or null",
    "pastParticiple": "... or null",
    "thirdPerson": "... or null",
    "plural": "... or null"
  }
}
```

## 生效范围
- `enrich-vocab-ai.ts` — 词汇书批量富集
- `article.service.ts` `getWordAnnotation` — 外刊查词
- 以后新增的任何 AI 单词查询接口

## 后台运行

**脚本**: `pnpm --filter server exec tsx scripts/enrich-vocab-ai.ts all`
**日志**: `/tmp/enrich-progress.log`
**检查进度**: `tail -3 /tmp/enrich-progress.log`
**检查运行中**: `ps aux | grep enrich-vocab | grep -v grep`

**行为**:
- 处理全部 ~7200 个 WordAnnotation
- 跳过已完整的数据
- 创建变形词时立即递归富集并建立双向链接
- 限速: 每10个停500ms，每50个停2s
