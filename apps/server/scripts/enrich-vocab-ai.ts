import { PrismaClient } from '@prisma/client';
import { config } from '../src/config/index.js';

const p = new PrismaClient();
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

interface AIResult {
  phoneticUk: string;
  phoneticUs: string;
  partOfSpeech: string;
  translation: string;
  examples: { en: string; zh: string }[];
}

async function enrichWord(word: string): Promise<AIResult | null> {
  const prompt = `Annotate the English word "${word}" as a dictionary entry. Return ONLY valid JSON:

{
  "phoneticUk": "UK IPA pronunciation",
  "phoneticUs": "US IPA pronunciation",
  "partOfSpeech": "n./v./adj./adv./etc.",
  "translation": "Chinese translation (concise, 2-8 characters)",
  "examples": [
    {"en": "English example sentence 1", "zh": "Chinese translation 1"},
    {"en": "English example sentence 2", "zh": "Chinese translation 2"},
    {"en": "English example sentence 3", "zh": "Chinese translation 3"}
  ]
}`;

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.deepseek.apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a precise English dictionary. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`  API error ${response.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const result = JSON.parse(jsonStr) as AIResult;
      if (!result.phoneticUk || !result.translation) return null;
      return result;
    } catch {
      console.error(`  JSON parse failed: ${jsonStr.slice(0, 100)}`);
      return null;
    }
  } catch (err: any) {
    console.error(`  Fetch error: ${err.message}`);
    return null;
  }
}

async function main() {
  const book = await p.vocabularyBook.findUnique({ where: { slug: 'ielts-vocab-real' } });
  if (!book) { console.error('Book not found'); return; }

  // Get words that need enrichment (no phonetic, or partOfSpeech is null)
  const words = await p.vocabularyWord.findMany({
    where: { bookId: book.id },
    orderBy: { wordIndex: 'asc' },
    select: { id: true, word: true, partOfSpeech: true, phonetic: true, translation: true },
  });

  console.log(`Processing ${words.length} words...`);

  let done = 0;
  let success = 0;

  for (const w of words) {
    // Target specific words if IDs provided via env var, otherwise skip already-good words
    const targetIds = process.env.TARGET_IDS ? process.env.TARGET_IDS.split(',').map(Number) : null;
    if (targetIds) {
      if (!targetIds.includes(w.id)) { done++; continue; }
    } else {
      if (w.phonetic && w.partOfSpeech && w.translation.length > 2 && !w.translation.startsWith('.')) {
        done++;
        continue;
      }
    }

    console.log(`[${done + 1}/${words.length}] ${w.word}...`);
    const ai = await enrichWord(w.word);

    if (ai) {
      // Strip slashes from phonetics
      const cleanUk = ai.phoneticUk.replace(/^\/|\/$/g, '');
      const cleanUs = ai.phoneticUs.replace(/^\/|\/$/g, '');
      await p.vocabularyWord.update({
        where: { id: w.id },
        data: {
          partOfSpeech: ai.partOfSpeech,
          translation: ai.translation,
          exampleSentence: ai.examples[0] ? `${ai.examples[0].en}\n${ai.examples[0].zh}` : null,
        },
      });

      // Upsert WordAnnotation with full data
      await p.wordAnnotation.upsert({
        where: { word: w.word },
        create: {
          word: w.word,
          phoneticUk: ai.phoneticUk,
          phoneticUs: ai.phoneticUs,
          partOfSpeech: ai.partOfSpeech,
          translation: ai.translation,
          examplesJson: JSON.stringify(ai.examples),
        },
        update: {
          phoneticUk: ai.phoneticUk,
          phoneticUs: ai.phoneticUs,
          partOfSpeech: ai.partOfSpeech,
          translation: ai.translation,
          examplesJson: JSON.stringify(ai.examples),
        },
      });

      // Link word to annotation
      const ann = await p.wordAnnotation.findUnique({ where: { word: w.word } });
      if (ann) {
        await p.vocabularyWord.update({ where: { id: w.id }, data: { wordAnnotationId: ann.id } });
      }

      success++;
    }

    done++;

    // Rate limit: small delay between requests
    if (done % 10 === 0) {
      console.log(`  Progress: ${done}/${words.length} (${success} enriched)`);
      await new Promise(r => setTimeout(r, 500)); // 500ms pause every 10
    }

    // Longer pause every 50 to avoid rate limits
    if (done % 50 === 0) {
      console.log(`  Cooling down...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\nDone! Enriched ${success}/${words.length} words`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
