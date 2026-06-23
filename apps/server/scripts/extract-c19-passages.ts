import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const raw = fs.readFileSync('/tmp/c19_new.txt', 'utf-8');
const lines = raw.split('\n');

// ── Find all READING PASSAGE boundaries ──
interface PassageLoc {
  testNum: number;
  passageNum: number;
  startLine: number;
  questionsStartLine: number;
  endLine: number;
}

let currentTest = 0;
const passages: PassageLoc[] = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]!.trim();
  const tm = line.match(/^Test\s+(\d+)$/);
  if (tm) currentTest = parseInt(tm[1]!);
  const pm = line.match(/^READING\s+PASSAGE\s+(\d+)$/);
  if (pm && currentTest >= 1 && currentTest <= 4) {
    passages.push({ testNum: currentTest, passageNum: parseInt(pm[1]!), startLine: i, questionsStartLine: -1, endLine: -1 });
  }
}

// Find questionsStartLine and endLine
for (let pi = 0; pi < passages.length; pi++) {
  const pass = passages[pi]!;
  const nextPass = passages[pi + 1];
  const searchEnd = nextPass ? nextPass.startLine : lines.length;

  // Find first "Questions X-Y" after passage start
  for (let i = pass.startLine + 1; i < searchEnd; i++) {
    if (lines[i]!.trim().match(/^Questions\s+\d+/)) {
      pass.questionsStartLine = i;
      break;
    }
  }
  if (pass.questionsStartLine === -1) pass.questionsStartLine = searchEnd;

  // End: same-test next passage, or next test boundary, or Answer key
  const sameTest = nextPass && nextPass.testNum === pass.testNum;
  if (sameTest) {
    pass.endLine = nextPass.startLine;
  } else {
    // Last passage of this test — end at next "Test X" or "Answer" line
    for (let i = pass.questionsStartLine + 1; i < lines.length; i++) {
      const t = lines[i]!.trim();
      if (/^Answers?\s/.test(t) || t.match(/^Test\s+\d+$/)) {
        pass.endLine = i;
        break;
      }
    }
    if (pass.endLine === -1) pass.endLine = lines.length;
  }
}

// ── Clean text (C19-specific boilerplate) ──
function isBoilerplate(s: string): boolean {
  s = s.trim();
  if (!s) return false;
  if (['CAMBRIDGE', 'Reading', 'READING', 'Academic', 'Authentic Practice Tests',
       'Produced by Cambridge University Press & Assessment'].includes(s)) return true;
  if (s.startsWith('https://azadenglish.com')) return true;
  if (s.startsWith('Instagram:')) return true;
  if (/^\d+$/.test(s)) return true;
  if (s.startsWith('You should spend about')) return true;
  if (/^(Reading\s+)?Passage\s+\d+\s*(below\.?)?$/i.test(s)) return true;
  return false;
}

function cleanText(rawLines: string[]): string {
  // Filter boilerplate, collapse consecutive empty lines
  const filtered: string[] = [];
  let prevEmpty = false;
  for (const line of rawLines) {
    if (isBoilerplate(line)) continue;
    const isEmpty = !line.trim();
    if (isEmpty && prevEmpty) continue;
    prevEmpty = isEmpty;
    filtered.push(line);
  }
  while (filtered.length && !filtered[0]!.trim()) filtered.shift();
  while (filtered.length && !filtered[filtered.length - 1]!.trim()) filtered.pop();

  // Detect paragraph boundaries in text without blank lines
  const allParas: string[] = [];
  let paraLines: string[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const line = filtered[i]!.trim();
    if (!line) { if (paraLines.length > 0) { allParas.push(paraLines.join(' ')); paraLines = []; } continue; }
    paraLines.push(line);

    // Title detection: first line is short, no punctuation → standalone title
    if (paraLines.length === 1 && allParas.length === 0 && line.length < 100 && !/[.?!]$/.test(line)) {
      let nextLine = '';
      for (let j = i + 1; j < filtered.length; j++) { const t = filtered[j]!.trim(); if (t) { nextLine = t; break; } }
      if (nextLine && /^[A-Z]/.test(nextLine) && nextLine.length > 15) { allParas.push(line); paraLines = []; continue; }
    }

    if (/[.?!]["')\]]?\s*$/.test(line) && line.length < 75) {
      let nextLine = '';
      for (let j = i + 1; j < filtered.length; j++) { const t = filtered[j]!.trim(); if (t) { nextLine = t; break; } }
      if (nextLine && /^[A-Z]/.test(nextLine) && nextLine.length > 15) { allParas.push(paraLines.join(' ')); paraLines = []; }
    }
  }
  if (paraLines.length > 0) allParas.push(paraLines.join(' '));

  // Post-process: merge paragraphs broken mid-sentence by page artifacts
  const merged: string[] = [];
  for (const para of allParas) {
    const t = para.trim();
    if (!t) continue;
    if (/^[A-I]$/.test(t)) { merged.push(para); continue; }
    if (merged.length > 0) {
      const prev = merged[merged.length - 1]!.trim();
      if (/^[A-I]$/.test(prev)) { merged.push(para); continue; }
      if (prev.length < 120 && prev.split(/\s+/).length <= 15) { merged.push(para); continue; }
      if (!/[.?!]["')\]]?\s*$/.test(prev)) { merged[merged.length - 1] += ' ' + t; continue; }
    }
    merged.push(para);
  }
  return merged.join('\n\n').trim();
}

// ── Extract ──
interface Extracted {
  passageText: string;
  questionInstructions: string;
}

const extracted = new Map<string, Extracted>();

for (const pass of passages) {
  const passageSlice = lines.slice(pass.startLine + 1, pass.questionsStartLine);
  const passageText = cleanText(passageSlice);

  const questionsSlice = lines.slice(pass.questionsStartLine, pass.endLine);
  const questionInstructions = cleanText(questionsSlice);

  const key = `${pass.testNum}:${pass.passageNum}`;
  extracted.set(key, { passageText, questionInstructions });
  console.log(`Test ${pass.testNum} P${pass.passageNum}: passage=${passageText.length} chars, questions=${questionInstructions.length} chars`);
  if (questionInstructions.length > 0) {
    console.log(`  Q preview: ${questionInstructions.substring(0, 100)}...`);
  }
}

// ── Database update ──
const testToExam: Record<number, number> = { 1: 191, 2: 192, 3: 193, 4: 194 };

async function main() {
  for (const pass of passages) {
    const key = `${pass.testNum}:${pass.passageNum}`;
    const ext = extracted.get(key)!;
    if (!ext || ext.passageText.length < 500) {
      console.log(`SKIP Test ${pass.testNum} P${pass.passageNum}: passage too short`);
      continue;
    }

    const examId = testToExam[pass.testNum]!;
    const sectionIndex = pass.passageNum;

    const section = await p.iELTSExamSection.findFirst({
      where: { examId, sectionIndex },
      select: { id: true, title: true },
    });

    if (!section) {
      console.log(`NOT FOUND: exam ${examId} section ${sectionIndex}`);
      continue;
    }

    const newInstructions = ext.passageText + '\n\n' + ext.questionInstructions;
    await p.iELTSExamSection.update({
      where: { id: section.id },
      data: { instructions: newInstructions },
    });

    console.log(`OK exam ${examId} S${sectionIndex} "${section.title}": ${newInstructions.length} chars total`);
  }

  console.log('\n=== C19 complete ===');
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
