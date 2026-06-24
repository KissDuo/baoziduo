import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

const TXT_PATH = '/tmp/gaokao_vocab.txt';
const BOOK_SLUG = 'gaokao-3500';
const BOOK_NAME = '高考必备3500词汇';
const CATEGORY = '高考';

// ── Step 1: Extract words ──
const raw = fs.readFileSync(TXT_PATH, 'utf-8');
const lines = raw.split('\n');

const words = new Set<string>();

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  // Skip section headers: "高考英语3500词汇表A"
  if (/^高考英语|^[A-Z]$|^附录|^不规则动词|^数词|^月份|^星期/.test(trimmed)) continue;

  // Extract the first English word: "word [...]pos. translation"
  // Match: start of line, an English word (letters, hyphens, maybe spaces in multi-word terms)
  const wordMatch = trimmed.match(/^([a-zA-Z][-a-zA-Z]*)/);
  if (!wordMatch) continue;

  const word = wordMatch[1]!.toLowerCase();
  // Skip very short words (articles, prepositions that might be parsing noise)
  if (word.length < 2) continue;
  // Skip pure numbers
  if (/^\d+$/.test(word)) continue;

  words.add(word);
}

const uniqueWords = Array.from(words).sort();
console.log(`Extracted ${uniqueWords.length} unique words`);
console.log('Sample:', uniqueWords.slice(0, 10).join(', '));
console.log('...');
console.log('Last:', uniqueWords.slice(-10).join(', '));

// ── Step 2: Create book and insert words ──
async function main() {
  // Upsert book
  const book = await p.vocabularyBook.upsert({
    where: { slug: BOOK_SLUG },
    create: {
      name: BOOK_NAME,
      slug: BOOK_SLUG,
      description: '高考英语必备3500词汇',
      category: CATEGORY,
      totalWords: uniqueWords.length,
      isPublished: true,
      sortOrder: 3,
    },
    update: { totalWords: uniqueWords.length },
  });
  console.log(`Book: ${book.name} (id=${book.id})`);

  // Clear existing words for this book (re-import)
  await p.vocabularyWord.deleteMany({ where: { bookId: book.id } });

  let created = 0;
  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i]!;

    // Find or create WordAnnotation
    const annotation = await p.wordAnnotation.upsert({
      where: { word },
      create: { word, translation: '[Pending]' },
      update: {},
    });

    await p.vocabularyWord.create({
      data: {
        bookId: book.id,
        wordAnnotationId: annotation.id,
        word,
        translation: annotation.translation === '[Pending]' ? '' : annotation.translation,
        wordIndex: i + 1,
      },
    });
    created++;
  }

  await p.vocabularyBook.update({ where: { id: book.id }, data: { totalWords: created } });

  // Tag
  const tag = await p.wordTag.upsert({ where: { name: CATEGORY }, create: { name: CATEGORY }, update: {} });
  const vocabWords = await p.vocabularyWord.findMany({ where: { bookId: book.id, wordAnnotationId: { not: null } } });
  for (const w of vocabWords) {
    await p.wordAnnotationTag.upsert({
      where: { wordAnnotationId_tagId: { wordAnnotationId: w.wordAnnotationId!, tagId: tag.id } },
      create: { wordAnnotationId: w.wordAnnotationId!, tagId: tag.id },
      update: {},
    });
  }

  console.log(`Created ${created} words, tagged with ${CATEGORY}`);
  console.log('Done! Ready for AI enrichment.');
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
