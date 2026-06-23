import { execSync } from 'child_process';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const PDF_PATH = '/Users/duochunheng/Downloads/雅思词汇真经彩色单词表表格.pdf';
const BOOK_SLUG = 'ielts-vocab-real';
const BOOK_NAME = '雅思词汇真经';
const CATEGORY = 'ielts';

// ── Step 1: Extract text with pdftotext -layout ──
console.log('Extracting PDF...');
execSync(`pdftotext -layout "${PDF_PATH}" /tmp/vocab_book_raw.txt`);
const raw = fs.readFileSync('/tmp/vocab_book_raw.txt', 'utf-8');
const lines = raw.split('\n');

// ── Step 2: Find column positions from header (per page, as positions may shift) ──
function findColPositions(lines: string[], startIdx: number): number[] {
  for (let i = startIdx; i < Math.min(startIdx + 10, lines.length); i++) {
    const line = lines[i]!;
    if (line.includes('序') && line.includes('单词') && line.includes('释义')) {
      const positions: number[] = [];
      let idx = 0;
      while ((idx = line.indexOf('序', idx)) !== -1) {
        positions.push(idx);
        idx++;
      }
      if (positions.length >= 3) return positions;
    }
  }
  return [];
}

function sliceColumns(line: string, positions: number[]): string[] {
  if (positions.length < 3) return [];
  const result: string[] = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i]!;
    const end = i + 1 < positions.length ? positions[i + 1]! : line.length;
    result.push(line.substring(start, end));
  }
  return result;
}

// ── Step 3: Parse chapters and words ──
interface ParsedWord {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  translation: string;
  chapter: string;
}

const allWords: ParsedWord[] = [];
let currentChapter = '';
let currentColPositions: number[] = [];

for (let li = 0; li < lines.length; li++) {
  const line = lines[li]!;
  const trimmed = line.trim();
  if (!trimmed) continue;

  // Detect chapter header
  const chapterMatch = trimmed.match(/^(Chapter\d+.+?List\s*\d+)/i);
  if (chapterMatch) {
    currentChapter = chapterMatch[1]!.trim();
    // Re-scan column positions for this chapter
    currentColPositions = findColPositions(lines, li);
    console.log('  Chapter:', currentChapter, currentColPositions.length >= 3 ? '(cols found)' : '(NO COLS!)');
    continue;
  }

  // Skip non-word lines
  if (trimmed.startsWith('序') || trimmed.startsWith('Date') || trimmed.startsWith('£') ||
      trimmed.includes('需要完整') || trimmed.includes('加微信') || trimmed.startsWith('Chapter')) continue;

  if (currentColPositions.length < 3) continue;

  // Slice the line into 3 columns
  const cols = sliceColumns(line, currentColPositions);
  if (cols.length < 3) continue;

  for (const col of cols) {
    const cell = col.trim();
    // Match: number + spaces + word + rest
    const m = cell.match(/^(\d+)\s+([a-zA-Z][-a-zA-Z]*\s*[a-zA-Z]*)\s*(.*)$/);
    if (!m) continue;

    const word = m[2]!.replace(/\s+/g, ' ').trim().toLowerCase();
    const rest = m[3]!.trim();
    if (!word || word.length < 2) continue;

    // Extract part of speech: "n.", "v.", "adj.", "adv.", "n/adj", "n/v" etc.
    const posMatch = rest.match(/^([nvadpcr]{1,4}[./]?\s*[nvadpcr]{0,4}[./]?)\s+/i);
    const partOfSpeech = posMatch ? posMatch[1]!.trim() : undefined;
    let translation = posMatch ? rest.substring(posMatch[0].length).trim() : rest;

    // Take Chinese part: characters until 3+ consecutive Latin letters or end
    const chEnd = translation.search(/[a-zA-Z]{3,}/);
    if (chEnd > 0) translation = translation.substring(0, chEnd).trim();
    translation = translation.replace(/[,，;；]\s*$/, '').trim();

    if (!translation) continue;

    allWords.push({ word, partOfSpeech, translation, chapter: currentChapter });
  }
}

console.log(`\nParsed ${allWords.length} words`);

// ── Step 3: Deduplicate and insert ──
// Dedup by (word, chapter) — same word can appear in multiple chapters
const seen = new Set<string>();
const uniqueWords: ParsedWord[] = [];
for (const w of allWords) {
  const key = `${w.word}|${w.chapter}`;
  if (seen.has(key)) continue;
  seen.add(key);
  uniqueWords.push(w);
}
console.log(`After dedup: ${uniqueWords.length} unique words`);

// ── Step 4: Create book and insert words ──
async function main() {
  // Upsert the book
  const book = await p.vocabularyBook.upsert({
    where: { slug: BOOK_SLUG },
    create: {
      name: BOOK_NAME,
      slug: BOOK_SLUG,
      description: '雅思词汇真经 - 按自然地理、环境保护等主题分类',
      category: CATEGORY,
      totalWords: uniqueWords.length,
      isPublished: true,
      sortOrder: 2,
    },
    update: { totalWords: uniqueWords.length },
  });
  console.log(`Book: ${book.name} (id=${book.id})`);

  // Insert words with dedup at the WordAnnotation level
  let created = 0;
  let linked = 0;

  for (let i = 0; i < uniqueWords.length; i++) {
    const w = uniqueWords[i]!;

    // Find or create WordAnnotation (global dictionary, unique by word)
    const annotation = await p.wordAnnotation.upsert({
      where: { word: w.word },
      create: {
        word: w.word,
        partOfSpeech: w.partOfSpeech || null,
        translation: w.translation,
      },
      update: {
        // Update translation if new one is more specific
        translation: w.translation.length > (await p.wordAnnotation.findUnique({ where: { word: w.word }, select: { translation: true } }))?.translation?.length
          ? w.translation  // keep longer translation
          : undefined,
        partOfSpeech: w.partOfSpeech || undefined,
      },
    });

    // Upsert VocabularyWord (book-specific entry)
    const existing = await p.vocabularyWord.findFirst({
      where: { bookId: book.id, word: w.word, chapter: w.chapter },
    });

    if (!existing) {
      await p.vocabularyWord.create({
        data: {
          bookId: book.id,
          wordAnnotationId: annotation.id,
          word: w.word,
          partOfSpeech: w.partOfSpeech || null,
          translation: w.translation,
          chapter: w.chapter,
          wordIndex: i + 1,
        },
      });
      created++;
    } else {
      linked++;
    }
  }

  // Update totalWords
  const actualCount = await p.vocabularyWord.count({ where: { bookId: book.id } });
  await p.vocabularyBook.update({ where: { id: book.id }, data: { totalWords: actualCount } });

  // Auto-tag: assign book category as tag to all WordAnnotations in this book
  const tagName = CATEGORY.toUpperCase();
  const tag = await p.wordTag.upsert({ where: { name: tagName }, create: { name: tagName }, update: {} });
  const wordsWithAnn = await p.vocabularyWord.findMany({ where: { bookId: book.id, wordAnnotationId: { not: null } }, select: { wordAnnotationId: true } });
  for (const w of wordsWithAnn) {
    await p.wordAnnotationTag.upsert({
      where: { wordAnnotationId_tagId: { wordAnnotationId: w.wordAnnotationId!, tagId: tag.id } },
      create: { wordAnnotationId: w.wordAnnotationId!, tagId: tag.id },
      update: {},
    });
  }
  console.log(`Tagged with ${tagName}`);

  console.log(`Created: ${created}, Already existed: ${linked}, Total: ${actualCount}`);

  // ── Show chapter distribution ──
  const chapters = await p.$queryRawUnsafe(
    `SELECT chapter, COUNT(*) as cnt FROM VocabularyWord WHERE bookId = ${book.id} GROUP BY chapter ORDER BY chapter`
  ) as any[];
  console.log('\nChapter distribution:');
  chapters.forEach((c: any) => console.log(`  ${c.chapter}: ${c.cnt} words`));

  await p.$disconnect();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
