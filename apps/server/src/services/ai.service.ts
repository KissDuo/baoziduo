import { config } from '../config/index.js';

const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

interface WordAnnotationResult {
  phoneticUk: string;
  phoneticUs: string;
  partOfSpeech: string;
  translation: string;
  examples: { en: string; zh: string }[];
}

export class AiService {
  /**
   * Translate text from English to Chinese using DeepSeek.
   */
  async translateText(text: string): Promise<string> {
    const prompt = `Translate the following English text to Chinese. Return ONLY the Chinese translation, no extra text:\n\n${text}`;

    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.deepseek.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional English-to-Chinese translator. Return only the translation, no explanations.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content?.trim() || '';
  }

  /**
   * Call DeepSeek to annotate a word with pronunciation, meaning, and examples.
   */
  async annotateWord(word: string): Promise<WordAnnotationResult> {
    const prompt = `You are an English dictionary API. Annotate the word "${word}".

Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
{
  "phoneticUk": "UK IPA pronunciation",
  "phoneticUs": "US IPA pronunciation",
  "partOfSpeech": "n./v./adj./adv./etc.",
  "translation": "Chinese translation",
  "examples": [
    {"en": "English example sentence 1", "zh": "Chinese translation 1"},
    {"en": "English example sentence 2", "zh": "Chinese translation 2"},
    {"en": "English example sentence 3", "zh": "Chinese translation 3"}
  ]
}
Provide 1-3 example sentences with their Chinese translations.`;

    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.deepseek.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a precise English dictionary. Always return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response (strip possible markdown fences)
    const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const result = JSON.parse(jsonStr) as WordAnnotationResult;
      // Validate required fields
      if (!result.phoneticUk || !result.translation) {
        throw new Error('Incomplete annotation response');
      }
      return result;
    } catch {
      throw new Error(`Failed to parse DeepSeek response as JSON: ${content.slice(0, 200)}`);
    }
  }
}

export const aiService = new AiService();
