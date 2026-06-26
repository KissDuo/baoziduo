// ═══════════════════════════════════════════
// Components barrel — 兼容旧导入，实际拆分到以下文件：
//   SharedComponents.tsx   — 共用：BlankInput, FillBlank, SingleChoice, MultiChoiceGroup, MatchingGroup, TableGroup
//   ListeningComponents.tsx — 听力专用：FormFillBlank, FlowchartMatching, NoteModeGroup
//   ReadingComponents.tsx   — 阅读专用：SummaryCompletion, TrueFalse
// ═══════════════════════════════════════════

export { BlankInput, FillBlank, SingleChoice, MultiChoiceGroup, MatchingGroup, TableGroup } from './SharedComponents';
export { FormFillBlank, FlowchartMatching, NoteModeGroup, MapLabelling } from './ListeningComponents';
export { SummaryCompletion, TrueFalse } from './ReadingComponents';
