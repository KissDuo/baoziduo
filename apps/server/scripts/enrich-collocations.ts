import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-7ce121aac01f456c918accf937fe4365';

async function generateExamples(phrase: string, translation: string): Promise<{ en: string; zh: string }[] | null> {
  const prompt = `For the English phrase "${phrase}" (meaning: ${translation}), generate natural example sentences. If the phrase has multiple distinct meanings, generate one example per meaning (up to 5). Otherwise generate 3 examples. Return ONLY valid JSON:
[
  {"en": "English sentence using '${phrase}'", "zh": "Chinese translation"}
]`;
  try {
    const res = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 800 }),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content?.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim() || '';
    return JSON.parse(content);
  } catch { return null; }
}

async function main() {
  const all = await p.collocation.findMany({
    where: { examplesJson: null },
    orderBy: { id: 'asc' },
  });
  console.log(`Phrases without examples: ${all.length}`);

  let done = 0;
  for (const col of all) {
    console.log(`[${done + 1}/${all.length}] ${col.phrase}...`);
    const examples = await generateExamples(col.phrase, col.translation);
    if (examples && examples.length > 0) {
      await p.collocation.update({
        where: { id: col.id },
        data: { examplesJson: JSON.stringify(examples) },
      });
      done++;
      console.log(`  ✅ ${examples.length} examples`);
    } else {
      console.log(`  ❌ failed`);
    }

    if (done % 100 === 0) console.log(`  Progress: ${done}/${all.length}`);
    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nDone! Enriched ${done}/${all.length} phrases`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
