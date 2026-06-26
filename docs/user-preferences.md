---
name: user-preferences
description: User preferences and interaction conventions
metadata: 
  node_type: memory
  type: user
  originSessionId: d77b4ebf-0623-4ac4-be24-51ee1f5daafe
---

# 用户偏好与交互约定

## "查询规则" 命令

当用户说"查询规则" + 问题描述时：
1. 根据问题关键词自动匹配相关规则文档（IELTS 段落标记、答题区、提示提取、数据提取等）
2. 读取匹配的规则文档
3. 按照文档中的规则检查和修复问题
4. 不需要用户记住具体文档名称

关键词映射：
- "段落标记" / "ABCD" / "字母标记" / "换行" / "标题" / "副标题" → [[ielts-passage-rendering-rules]]
- "答题区" / "提示" / "hint" / "Questions X-Y" / "题目序号" → [[ielts-questions-panel-rules]]
- "题型提示" / "提示模板" / "提示语" → [[ielts-question-hints]]
- "数据提取" / "PDF" / "提取脚本" / "boilerplate" → [[ielts-data-extraction-rules]]
- 不确定时 → 读取全部规则文档

## 代码修改偏好
- 数据问题优先在提取脚本层面修复，不在前端打补丁
- 前端渲染尊重原始数据结构，不做过度智能判断
- 所有用户可见文字使用英文，注释可以用中文
- **提示句锁死**：`getStandardHint()` 中的提示句未经用户允许不得修改。修改其他 bug 时不要动这些提示句。
- **自动推送**：用户说"保存"后，commit + push 到 GitHub `KissDuo/baoziduo`

**How to apply:** 用户说"查询规则"时自动触发。
