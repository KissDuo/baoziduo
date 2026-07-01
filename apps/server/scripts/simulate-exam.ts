/**
 * ═══════════════════════════════════════════════════════════
 * 模拟真实用户做题流程 — 全随机答题
 *
 * 用法:
 *   pnpm --filter server exec tsx scripts/simulate-exam.ts            # 随机听力
 *   pnpm --filter server exec tsx scripts/simulate-exam.ts reading    # 随机阅读
 * ═══════════════════════════════════════════════════════════════════
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const API_BASE = 'http://localhost:5201/api/v1';
const TEST_EMAIL = 'sim@test.com';
const TEST_PASSWORD = '12345678';

interface Question {
  id: number;
  questionIndex: number;
  questionType: string;
  questionText: string | null;
  options: any;
  correctAnswer: string;
  passageText: string | null;
}

interface Section {
  id: number;
  sectionIndex: number;
  title: string;
  questions: Question[];
}

interface ExamDetail {
  id: number;
  title: string;
  type: string;
  sections: Section[];
}

interface Attempt {
  id: number;
  examId: number;
  status: string;
  savedAnswers: Record<string, string>;
}

interface Result {
  totalScore: number;
  maxScore: number;
  sectionScores: { sectionTitle: string; score: number; maxScore: number; correctCount: number; totalCount: number }[];
}

// ══ Cookie jar for httpOnly cookies ══
let cookieJar = '';

async function api(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any || {}) };
  if (cookieJar) headers['Cookie'] = cookieJar;

  const res = await fetch(url, { ...options, headers });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const cookies = setCookie.split(',').map(c => c.trim().split(';')[0]);
    cookieJar = cookies.join('; ');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`${res.status} ${body.error || res.statusText}`);
  }
  return res.json();
}

// ══ Create test user ══
async function ensureTestUser() {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    if (!existing) {
      const hash = await hashPassword(TEST_PASSWORD);
      await prisma.user.create({ data: { email: TEST_EMAIL, passwordHash: hash, nickname: 'SimBot' } });
      console.log('  ✓ 已创建测试账号 sim@test.com / 12345678');
    } else {
      console.log('  ✓ 测试账号已存在');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// ══ API wrappers ══
async function login() {
  await api('/auth/login/email', { method: 'POST', body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }) });
  console.log('  ✓ 已登录');
}
async function listExams() { return api('/ielts/exams'); }
async function getExamDetail(examId: number): Promise<ExamDetail> { return api(`/ielts/exams/${examId}`); }
async function startAttempt(examId: number): Promise<Attempt> { return api(`/ielts/exams/${examId}/start`, { method: 'POST' }); }
async function saveAnswer(attemptId: number, questionId: number, answer: string) {
  return api(`/ielts/attempts/${attemptId}/answer`, { method: 'POST', body: JSON.stringify({ questionId, answer }) });
}
async function submitAttempt(attemptId: number): Promise<Result> { return api(`/ielts/attempts/${attemptId}/submit`, { method: 'POST' }); }

// ══ Random answer generator ══
function parseOptions(opts: any): string[] {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try { const p = JSON.parse(opts); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

function generateAnswer(q: Question): string {
  const options = parseOptions(q.options);

  switch (q.questionType) {
    case 'fill_blank':
      // Random word or the correct answer
      return Math.random() > 0.5 ? (q.correctAnswer || 'answer') : 'randomword';

    case 'multiple_choice':
      if (options.length === 0) return 'A';
      return options[Math.floor(Math.random() * options.length)];

    case 'matching':
      // Matching answers are LETTERS (A, B, C...), not option text
      return String.fromCharCode(65 + Math.floor(Math.random() * Math.min(options.length || 6, 8)));

    case 'true_false':
    case 'yes_no': {
      const tf = ['TRUE', 'FALSE', 'NOT GIVEN'];
      return tf[Math.floor(Math.random() * 3)];
    }

    default:
      return q.correctAnswer || 'unknown';
  }
}

// ═══════════════════════════════════
// Main
// ═══════════════════════════════════
async function main() {
  const examType = process.argv[2] || 'listening';

  console.log('╔══════════════════════════════════════╗');
  console.log('║   IELTS 考试模拟 — 全随机答题 🎲     ║');
  console.log('╚══════════════════════════════════════╝\n');

  console.log('[0/6] 准备测试账号...');
  await ensureTestUser();

  console.log('[1/6] 登录...');
  await login();

  console.log('[2/6] 获取考试列表...');
  const exams = await listExams();
  const filtered = exams.filter((e: any) => e.type === examType);
  if (filtered.length === 0) { console.log(`  ✗ 没有 ${examType} 考试`); return; }
  const exam = filtered[Math.floor(Math.random() * filtered.length)] as any;
  console.log(`  ✓ 随机选中: ${exam.title} (${exam.totalQuestions}题)`);

  console.log('[3/6] 获取考试详情...');
  const detail = await getExamDetail(exam.id);
  console.log(`  ┌─ Structure ───────────────────────────┐`);
  for (const s of detail.sections) {
    const tc: Record<string, number> = {};
    for (const q of s.questions) tc[q.questionType] = (tc[q.questionType] || 0) + 1;
    const ts = Object.entries(tc).map(([t, c]) => `${t}×${c}`).join(', ');
    console.log(`  │ P${s.sectionIndex}: ${(s.title || '').padEnd(22)} ${ts}`);
  }
  console.log(`  └────────────────────────────────────────┘`);

  console.log('[4/6] 开始答题...');
  const attempt = await startAttempt(exam.id);
  console.log(`  ✓ Attempt #${attempt.id}`);

  console.log('[5/6] 逐题随机作答...\n');
  let count = 0;
  for (const s of detail.sections) {
    console.log(`  ── Section ${s.sectionIndex}: ${s.title || ''} ──`);
    for (const q of s.questions) {
      const answer = generateAnswer(q);
      await saveAnswer(attempt.id, q.id, answer);
      count++;
      const tag = `[${q.questionType}]`.padEnd(16);
      const preview = (q.questionText || '(passage)').slice(0, 32);
      console.log(`    Q${String(q.questionIndex).padStart(2)} ${tag} ${preview.padEnd(35)} → "${answer.slice(0, 22)}"`);
    }
    console.log();
  }

  console.log(`[6/6] 提交试卷 (${count}题)...`);
  const result = await submitAttempt(attempt.id);

  const pct = Math.round(result.totalScore / result.maxScore * 100);
  const emoji = pct >= 90 ? '🎉' : pct >= 60 ? '👍' : pct >= 30 ? '📚' : '🎲';

  console.log(`  ╔══════════════════════════════════════╗`);
  console.log(`  ║  🎲 全随机答题                       ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  总分: ${String(result.totalScore).padStart(2)} / ${result.maxScore}  (${String(pct).padStart(2)}%)                 ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  for (const ss of result.sectionScores) {
    const sp = ss.maxScore > 0 ? Math.round(ss.score / ss.maxScore * 100) : 0;
    console.log(`  ║  ${(ss.sectionTitle || '').padEnd(22)} ${String(ss.correctCount).padStart(2)}/${ss.totalCount} (${String(sp).padStart(2)}%)             ║`);
  }
  console.log(`  ╚══════════════════════════════════════╝`);
  console.log(`\n  ${emoji} 随机正确率: ${pct}%`);
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
