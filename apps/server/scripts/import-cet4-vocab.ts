import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const raw = fs.readFileSync('/tmp/cet4_vocab.txt', 'utf-8');
const lines = raw.split('\n');
const words = new Set<string>();

for (const line of lines) {
  const t = line.trim();
  if (!t || /^[A-Z]$/.test(t) || t.includes('www.') || t.includes('大学英语') || t.includes('---')) continue;
  const m = t.match(/^([a-zA-Z][-a-zA-Z]*)/);
  if (!m) continue;
  const word = m[1].toLowerCase();
  if (word.length < 2) continue;
  words.add(word);
}

const uniqueWords = Array.from(words).sort();
console.log(`Extracted ${uniqueWords.length} unique words`);

async function main() {
  const book = await p.vocabularyBook.upsert({
    where: { slug: 'cet4-4500' },
    create: { name: 'CET-4 4500词汇', slug: 'cet4-4500', description: '大学英语四级考试4500词汇', category: 'cet4', totalWords: uniqueWords.length, isPublished: true, sortOrder: 4 },
    update: { totalWords: uniqueWords.length },
  });
  console.log(`Book: ${book.name} id=${book.id}`);

  await p.vocabularyWord.deleteMany({ where: { bookId: book.id } });

  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i]!;
    const ann = await p.wordAnnotation.upsert({ where: { word }, create: { word, translation: '' }, update: {} });
    await p.vocabularyWord.create({ data: { bookId: book.id, wordAnnotationId: ann.id, word, translation: ann.translation || '', wordIndex: i + 1 } });
  }

  const tag = await p.wordTag.upsert({ where: { name: 'CET-4' }, create: { name: 'CET-4' }, update: {} });
  const allWords = await p.vocabularyWord.findMany({ where: { bookId: book.id, wordAnnotationId: { not: null } }, select: { wordAnnotationId: true } });
  for (const w of allWords) {
    await p.wordAnnotationTag.upsert({ where: { wordAnnotationId_tagId: { wordAnnotationId: w.wordAnnotationId!, tagId: tag.id } }, create: { wordAnnotationId: w.wordAnnotationId!, tagId: tag.id }, update: {} });
    process.stdout.write(`\rTagging ${allWords.indexOf(w) + 1}/${allWords.length}`);
  }
  console.log();

  const total = await p.vocabularyWord.count({ where: { bookId: book.id } });
  const withPhonetic = await p.vocabularyWord.count({ where: { bookId: book.id, wordAnnotation: { phoneticUk: { not: null } } } });
  await p.vocabularyBook.update({ where: { id: book.id }, data: { totalWords: total } });
  console.log(`Total: ${total} | With phonetics: ${withPhonetic} | Need AI: ${total - withPhonetic}`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
