# IELTS 题型-组件-题库对照矩阵

> **长期记忆。** 每次新增/改动题库、改动题型代码时，必须同步更新本表。
> 区分听力和阅读，各自独立。

---

## 听力 (Listening)

### 题型分布总览

| Sub-type | Component | C18 | C19 | C20 |
|----------|-----------|-----|-----|-----|
| `fill_blank.note` | NoteModeGroup | T1-4 P1/P4 | T1-4 P1/P4 | T1-4 P1/P4* |
| `fill_blank.table` | TableGroup | — | T3P1 Q7, T4P1 Q7 | T1P1 Q1, T3P1 Q1 |
| `fill_blank.plain` | FillBlank | all P1/P4 non-first | all P1/P4 non-first | all P1/P4 non-first |
| `multiple_choice.single` | SingleChoice | T1P2, T1P3, T2P3, T3P2, T4P2, T4P3 | T1P2, T1P3, T2P2, T2P3, T3P2, T4P2, T4P3 | T1P2, T1P3, T2P2, T2P3, T3P2, T3P3, T4P2, T4P3 |
| `multiple_choice.multi` | MultiChoiceGroup | T1P2, T1P3, T2P2, T3P2, T4P3 | T2P2, T3P2, T4P2 | T1P2, T4P2, T4P3 |
| `matching.drag` | MatchingGroup | T1P2 Q16-20, T2P3 Q27-30, T3P3 Q25-30, T4P2 Q15-20, T4P3 Q23-27 | T1P2, T2P2, T3P2, T4P2, T2P3 Q25-28, T3P3 Q27-30, T4P3 Q26-30 | T2P2 Q11-16, T2P3 Q21-25, T3P3 Q27-30, T4P2 Q15-20 |
| `matching.flowchart` | FlowchartMatching | — | T3P3 Q26 | — |
| `map_labelling` | MapLabelling | T2P2 Q15-20 | T1P2 Q16-20 | T3P2 Q17-20 |

> *C20 T1P1 和 T3P1 是 `table`，其余 P1 是 `note`

### 逐题明细

| Book | Test | Part | Q Nos | Type | Sub-type | Component |
|------|------|------|-------|------|----------|-----------|
| C18 | T1 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C18 | T1 | P2 | Q11-15 | multiple_choice | single | SingleChoice |
| C18 | T1 | P2 | Q14-15 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T1 | P2 | Q16-20 | matching | drag | MatchingGroup |
| C18 | T1 | P3 | Q21-26 | multiple_choice | single | SingleChoice |
| C18 | T1 | P3 | Q27-28 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T1 | P3 | Q29-30 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T1 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C18 | T2 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C18 | T2 | P2 | Q11-12 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T2 | P2 | Q13-14 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T2 | P2 | Q15-20 | map_labelling | — | MapLabelling |
| C18 | T2 | P3 | Q21-24 | multiple_choice | single | SingleChoice |
| C18 | T2 | P3 | Q25-26 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T2 | P3 | Q27-30 | matching | drag | MatchingGroup |
| C18 | T2 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C18 | T3 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C18 | T3 | P2 | Q11-12 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T3 | P2 | Q13-14 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T3 | P2 | Q15-20 | multiple_choice | single | SingleChoice |
| C18 | T3 | P3 | Q21-22 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T3 | P3 | Q23-24 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T3 | P3 | Q25-30 | matching | drag | MatchingGroup |
| C18 | T3 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C18 | T4 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C18 | T4 | P2 | Q11-14 | multiple_choice | single | SingleChoice |
| C18 | T4 | P2 | Q15-20 | matching | drag | MatchingGroup |
| C18 | T4 | P3 | Q21-22 | multiple_choice | multi | MultiChoiceGroup |
| C18 | T4 | P3 | Q23-27 | matching | drag | MatchingGroup |
| C18 | T4 | P3 | Q28-30 | multiple_choice | single | SingleChoice |
| C18 | T4 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C19 | T1 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C19 | T1 | P2 | Q11-15 | multiple_choice | single | SingleChoice |
| C19 | T1 | P2 | Q16-20 | matching | drag | MatchingGroup |
| C19 | T1 | P3 | Q21-30 | multiple_choice | single | SingleChoice |
| C19 | T1 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C19 | T2 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C19 | T2 | P2 | Q11-13 | multiple_choice | single | SingleChoice |
| C19 | T2 | P2 | Q14-15 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T2 | P2 | Q16 | multiple_choice | single | SingleChoice |
| C19 | T2 | P2 | Q17-18 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T2 | P2 | Q19-20 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T2 | P3 | Q21-24 | multiple_choice | single | SingleChoice |
| C19 | T2 | P3 | Q25-28 | matching | drag | MatchingGroup |
| C19 | T2 | P3 | Q29-30 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T2 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C19 | T3 | P1 | Q1-6 | fill_blank | note | NoteModeGroup |
| C19 | T3 | P1 | Q7 | fill_blank | table | TableGroup |
| C19 | T3 | P1 | Q8-10 | fill_blank | note | NoteModeGroup |
| C19 | T3 | P2 | Q11-16 | matching | drag | MatchingGroup |
| C19 | T3 | P2 | Q17 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T3 | P2 | Q18 | multiple_choice | single | SingleChoice |
| C19 | T3 | P2 | Q19 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T3 | P2 | Q20 | multiple_choice | single | SingleChoice |
| C19 | T3 | P3 | Q21-25 | multiple_choice | single | SingleChoice |
| C19 | T3 | P3 | Q26 | matching | flowchart | FlowchartMatching |
| C19 | T3 | P3 | Q27-30 | matching | drag | MatchingGroup |
| C19 | T3 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C19 | T4 | P1 | Q1-6 | fill_blank | note | NoteModeGroup |
| C19 | T4 | P1 | Q7 | fill_blank | table | TableGroup |
| C19 | T4 | P1 | Q8-10 | fill_blank | note | NoteModeGroup |
| C19 | T4 | P2 | Q11-12 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T4 | P2 | Q13-14 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T4 | P2 | Q15-18 | matching | drag | MatchingGroup |
| C19 | T4 | P2 | Q19-20 | multiple_choice | single | SingleChoice |
| C19 | T4 | P3 | Q21-25 | multiple_choice | single | SingleChoice |
| C19 | T4 | P3 | Q26-30 | matching | drag | MatchingGroup |
| C19 | T4 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C20 | T1 | P1 | Q1 | fill_blank | table | TableGroup |
| C20 | T1 | P1 | Q2-10 | fill_blank | note | NoteModeGroup |
| C20 | T1 | P2 | Q11-16 | multiple_choice | single | SingleChoice |
| C20 | T1 | P2 | Q17-18 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T1 | P2 | Q19-20 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T1 | P3 | Q21-22 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T1 | P3 | Q23-24 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T1 | P3 | Q25-26 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T1 | P3 | Q27-30 | multiple_choice | single | SingleChoice |
| C20 | T1 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C20 | T2 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C20 | T2 | P2 | Q11-16 | matching | drag | MatchingGroup |
| C20 | T2 | P2 | Q17-20 | multiple_choice | single | SingleChoice |
| C20 | T2 | P3 | Q21-25 | matching | drag | MatchingGroup |
| C20 | T2 | P3 | Q26-30 | multiple_choice | single | SingleChoice |
| C20 | T2 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C20 | T3 | P1 | Q1 | fill_blank | table | TableGroup |
| C20 | T3 | P1 | Q2-10 | fill_blank | note | NoteModeGroup |
| C20 | T3 | P2 | Q11-16 | multiple_choice | single | SingleChoice |
| C20 | T3 | P2 | Q17-20 | map_labelling | — | MapLabelling |
| C20 | T3 | P3 | Q21-26 | multiple_choice | single | SingleChoice |
| C20 | T3 | P3 | Q27-30 | matching | drag | MatchingGroup |
| C20 | T3 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |
| C20 | T4 | P1 | Q1-10 | fill_blank | note | NoteModeGroup |
| C20 | T4 | P2 | Q11-12 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T4 | P2 | Q13-14 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T4 | P2 | Q15-20 | matching | drag | MatchingGroup |
| C20 | T4 | P3 | Q21-22 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T4 | P3 | Q23-30 | multiple_choice | single | SingleChoice |
| C20 | T4 | P4 | Q31-40 | fill_blank | note | NoteModeGroup |

---

## 阅读 (Reading)

### 题型分布总览

| Sub-type | Component | C18 | C19 | C20 |
|----------|-----------|-----|-----|-----|
| `fill_blank.plain` | FillBlank | T1-4 P1/P2/P3 | T1-4 P1/P2/P3 | T1-4 P1/P2/P3 |
| `true_false` | TrueFalse | T1P1, T2P1 | T1P1, T2P1, T3P1, T4P1, T1P3, T2P3, T3P3, T4P3 | T1P1, T2P1, T3P1, T4P1, T1P3, T2P3 |
| `yes_no` | TrueFalse | T2P2, T2P3, T3P3, T4P2, T4P3 | — | — |
| `multiple_choice.single` | SingleChoice | T2P2, T3P2, T3P3, T4P1, T4P2, T4P3 | T1P3, T2P3, T3P2, T4P3 | T1P3, T2P3, T3P3 |
| `multiple_choice.multi` | MultiChoiceGroup | T4P1 | T1P2, T2P2 | T2P2, T3P2 |
| `matching.drag` | MatchingGroup | T1P2, T1P3, T2P2, T3P1, T3P3, T4P1, T4P2, T4P3 | T1P2, T2P2, T3P2, T4P2, T1P3, T3P3 | T1P2, T2P2, T3P2, T4P2, T1P3, T2P3, T3P3, T4P3 |
| `heading_matching` | MapLabelling | T3P2 | — | — |

### 逐题明细

| Book | Test | Part | Q Nos | Type | Sub-type | Component |
|------|------|------|-------|------|----------|-----------|
| C18 | T1 | P1 | Q1-7 | fill_blank | plain | FillBlank |
| C18 | T1 | P1 | Q8-13 | true_false | — | TrueFalse |
| C18 | T1 | P2 | Q14-18 | matching | drag | MatchingGroup |
| C18 | T1 | P2 | Q19-21 | matching | drag | MatchingGroup |
| C18 | T1 | P2 | Q22-26 | fill_blank | plain | FillBlank |
| C18 | T1 | P3 | Q27-31 | matching | drag | MatchingGroup |
| C18 | T1 | P3 | Q32-34 | fill_blank | plain | FillBlank |
| C18 | T1 | P3 | Q35-40 | matching | drag | MatchingGroup |
| C18 | T2 | P1 | Q1-8 | fill_blank | plain | FillBlank |
| C18 | T2 | P1 | Q9-13 | true_false | — | TrueFalse |
| C18 | T2 | P2 | Q14-19 | multiple_choice | single | SingleChoice |
| C18 | T2 | P2 | Q20-23 | yes_no | — | TrueFalse |
| C18 | T2 | P2 | Q24-26 | matching | drag | MatchingGroup |
| C18 | T2 | P3 | Q27-30 | yes_no | — | TrueFalse |
| C18 | T2 | P3 | Q31-40 | fill_blank | plain | FillBlank |
| C18 | T3 | P1 | Q1-4 | matching | drag | MatchingGroup |
| C18 | T3 | P1 | Q5-8 | fill_blank | plain | FillBlank |
| C18 | T3 | P1 | Q9-13 | matching | drag | MatchingGroup |
| C18 | T3 | P2 | Q14-20 | heading_matching | — | MapLabelling |
| C18 | T3 | P2 | Q21-23 | multiple_choice | single | SingleChoice |
| C18 | T3 | P2 | Q24-26 | fill_blank | plain | FillBlank |
| C18 | T3 | P3 | Q27-30 | multiple_choice | single | SingleChoice |
| C18 | T3 | P3 | Q31-35 | matching | drag | MatchingGroup |
| C18 | T3 | P3 | Q36-40 | yes_no | — | TrueFalse |
| C18 | T4 | P1 | Q1-5 | matching | drag | MatchingGroup |
| C18 | T4 | P1 | Q6-9 | fill_blank | plain | FillBlank |
| C18 | T4 | P1 | Q10-13 | multiple_choice | multi/single | MultiChoiceGroup/SingleChoice |
| C18 | T4 | P2 | Q14-16 | multiple_choice | single | SingleChoice |
| C18 | T4 | P2 | Q17-22 | matching | drag | MatchingGroup |
| C18 | T4 | P2 | Q23-26 | yes_no | — | TrueFalse |
| C18 | T4 | P3 | Q27-30 | yes_no | — | TrueFalse |
| C18 | T4 | P3 | Q31-36 | matching | drag | MatchingGroup |
| C18 | T4 | P3 | Q37-40 | multiple_choice | single | SingleChoice |
| C19 | T1 | P1 | Q1-7 | true_false | — | TrueFalse |
| C19 | T1 | P1 | Q8-13 | fill_blank | plain | FillBlank |
| C19 | T1 | P2 | Q14-19 | matching | drag | MatchingGroup |
| C19 | T1 | P2 | Q20-21 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T1 | P2 | Q22-23 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T1 | P2 | Q24-26 | fill_blank | plain | FillBlank |
| C19 | T1 | P3 | Q27-30 | multiple_choice | single | SingleChoice |
| C19 | T1 | P3 | Q31-36 | matching | drag | MatchingGroup |
| C19 | T1 | P3 | Q37-40 | true_false | — | TrueFalse |
| C19 | T2 | P1 | Q1-7 | fill_blank | plain | FillBlank |
| C19 | T2 | P1 | Q8-13 | true_false | — | TrueFalse |
| C19 | T2 | P2 | Q14-18 | matching | drag | MatchingGroup |
| C19 | T2 | P2 | Q19-22 | fill_blank | plain | FillBlank |
| C19 | T2 | P2 | Q23-24 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T2 | P2 | Q25-26 | multiple_choice | multi | MultiChoiceGroup |
| C19 | T2 | P3 | Q27-32 | multiple_choice | single | SingleChoice |
| C19 | T2 | P3 | Q33-37 | true_false | — | TrueFalse |
| C19 | T2 | P3 | Q38-40 | multiple_choice | single | SingleChoice |
| C19 | T3 | P1 | Q1-7 | true_false | — | TrueFalse |
| C19 | T3 | P1 | Q8-13 | fill_blank | plain | FillBlank |
| C19 | T3 | P2 | Q14-17 | matching | drag | MatchingGroup |
| C19 | T3 | P2 | Q18-22 | fill_blank | plain | FillBlank |
| C19 | T3 | P2 | Q23-26 | multiple_choice | single | SingleChoice |
| C19 | T3 | P3 | Q27-30 | multiple_choice | single | SingleChoice |
| C19 | T3 | P3 | Q31-34 | matching | drag | MatchingGroup |
| C19 | T3 | P3 | Q35-40 | true_false | — | TrueFalse |
| C19 | T4 | P1 | Q1-6 | true_false | — | TrueFalse |
| C19 | T4 | P1 | Q7-13 | fill_blank | plain | FillBlank |
| C19 | T4 | P2 | Q14-17 | matching | drag | MatchingGroup |
| C19 | T4 | P2 | Q18-23 | matching | drag | MatchingGroup |
| C19 | T4 | P2 | Q24-26 | fill_blank | plain | FillBlank |
| C19 | T4 | P3 | Q27-30 | multiple_choice | single | SingleChoice |
| C19 | T4 | P3 | Q31-35 | fill_blank | plain | FillBlank |
| C19 | T4 | P3 | Q36-40 | true_false | — | TrueFalse |
| C20 | T1 | P1 | Q1-6 | true_false | — | TrueFalse |
| C20 | T1 | P1 | Q7-13 | fill_blank | plain | FillBlank |
| C20 | T1 | P2 | Q14-18 | matching | drag | MatchingGroup |
| C20 | T1 | P2 | Q19-23 | matching | drag | MatchingGroup |
| C20 | T1 | P2 | Q24-26 | fill_blank | plain | FillBlank |
| C20 | T1 | P3 | Q27-30 | multiple_choice | single | SingleChoice |
| C20 | T1 | P3 | Q31-35 | matching | drag | MatchingGroup |
| C20 | T1 | P3 | Q36-40 | true_false | — | TrueFalse |
| C20 | T2 | P1 | Q1-6 | fill_blank | plain | FillBlank |
| C20 | T2 | P1 | Q7-13 | true_false | — | TrueFalse |
| C20 | T2 | P2 | Q14-16 | matching | drag | MatchingGroup |
| C20 | T2 | P2 | Q17-22 | fill_blank | plain | FillBlank |
| C20 | T2 | P2 | Q23-24 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T2 | P2 | Q25-26 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T2 | P3 | Q27-32 | true_false | — | TrueFalse |
| C20 | T2 | P3 | Q33-37 | matching | drag | MatchingGroup |
| C20 | T2 | P3 | Q38-40 | multiple_choice | single | SingleChoice |
| C20 | T3 | P1 | Q1-7 | fill_blank | plain | FillBlank |
| C20 | T3 | P1 | Q8-13 | true_false | — | TrueFalse |
| C20 | T3 | P2 | Q14-19 | matching | drag | MatchingGroup |
| C20 | T3 | P2 | Q20-21 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T3 | P2 | Q22-23 | multiple_choice | multi | MultiChoiceGroup |
| C20 | T3 | P2 | Q24-26 | fill_blank | plain | FillBlank |
| C20 | T3 | P3 | Q27-33 | matching | drag | MatchingGroup |
| C20 | T3 | P3 | Q34-36 | matching | drag | MatchingGroup |
| C20 | T3 | P3 | Q37-40 | multiple_choice | single | SingleChoice |
| C20 | T4 | P1 | Q1-7 | fill_blank | plain | FillBlank |
| C20 | T4 | P1 | Q8-13 | true_false | — | TrueFalse |
| C20 | T4 | P2 | Q14-17 | matching | drag | MatchingGroup |
| C20 | T4 | P2 | Q18-22 | fill_blank | plain | FillBlank |
| C20 | T4 | P2 | Q23-26 | matching | drag | MatchingGroup |
| C20 | T4 | P3 | Q27-31 | matching | drag | MatchingGroup |
| C20 | T4 | P3 | Q32-36 | matching | drag | MatchingGroup |
| C20 | T4 | P3 | Q37-40 | fill_blank | plain | FillBlank |

---

## 图例

- **(none)** = 前端组件待开发（仅 `heading_matching`）
- **更新日志**: 2026-06-27 新增 MapLabelling 组件，三本书 KMF 校对完成，音频 URL 写入
