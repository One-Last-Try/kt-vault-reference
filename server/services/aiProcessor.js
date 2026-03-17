import Anthropic from '@anthropic-ai/sdk';

// Client is created lazily so a missing API key doesn't crash the server on startup
let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are a Kill Team rules extractor. Given raw text extracted from a Kill Team PDF, return ONLY valid JSON with no preamble, explanation, or markdown fences. Do not write anything before or after the JSON object.

The JSON must follow this exact structure:
{
  "source": "string (filename or version identifier)",
  "type": "string (e.g. 'compendium', 'update', 'errata')",
  "faction": "string or null",
  "rules": [
    {
      "category": "string (Core Rules | Actions | Injuries | Terrain | Missions)",
      "title": "string",
      "content": "string",
      "page_ref": "string or null"
    }
  ],
  "datacards": [
    {
      "operative_name": "string",
      "faction": "string",
      "role": "string or null",
      "stats": { "M": "string", "APL": "string", "GA": "string", "DF": "string", "SV": "string", "W": "string" },
      "weapons": [
        { "name": "string", "attacks": "string", "bs": "string", "damage": "string", "crit": "string", "special": "string" }
      ],
      "abilities": []
    }
  ],
  "team_rules": [
    {
      "faction": "string",
      "type": "string (strategic_ploy | tactical_ploy | equipment | tac_op)",
      "name": "string",
      "cost": 0,
      "description": "string"
    }
  ]
}

If a section has no data, use an empty array. Extract everything you can find.`;

function stripMarkdown(text) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

export async function processWithAI(text, filename) {
  try {
    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Extract all Kill Team rules data from this PDF text. Filename: ${filename}\n\n${text.slice(0, 12000)}`,
        },
      ],
    });

    const raw = message.content[0]?.text ?? '';
    const cleaned = stripMarkdown(raw);

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error('AI processing error:', err.message);
    return null;
  }
}
