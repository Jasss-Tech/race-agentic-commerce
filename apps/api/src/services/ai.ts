import OpenAI from 'openai';
import { BuyerIntent } from '@race/types';
import { BuyerAgent } from '@race/agent-core';
import { AIIntentSchema } from '../validation';

export class AIService {
  private providerName: string;
  private openai: OpenAI | null = null;
  private model: string;

  constructor() {
    this.providerName = process.env.AI_PROVIDER || 'deterministic';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const apiKey = process.env.OPENAI_API_KEY;
    if (this.providerName === 'openai' && apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  public getProvider(): string {
    return this.openai ? `openai (${this.model})` : 'deterministic-fallback';
  }

  /**
   * Parses natural language buyer prompt into structured intent with Zod validation
   * Falls back gracefully to deterministic keyword extraction if offline or unconfigured.
   */
  public async parseBuyerIntent(message: string): Promise<BuyerIntent> {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are the RACE Bounded-Autonomy Buyer Agent parser.
Extract structured commerce intent as valid JSON with fields:
- category: string (e.g. "keyboard", "mouse", "audio", "accessories")
- maxBudget: number or null (in INR)
- currency: "INR"
- action: "search" | "compare" | "purchase" | "inquire"
- tool: "catalog.search" | "catalog.compare" | "commerce.checkout"
- preferences: array of strings

Respond with JSON only.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);
        const validated = AIIntentSchema.safeParse(parsed);

        if (validated.success) {
          return {
            rawQuery: message,
            category: validated.data.category,
            maxBudget: validated.data.maxBudget,
            currency: validated.data.currency || 'INR',
            action: validated.data.action,
            tool: validated.data.tool || (validated.data.action === 'purchase' ? 'commerce.checkout' : 'catalog.search'),
            preferences: validated.data.preferences
          };
        }
      } catch (err: any) {
        console.warn('⚠️ OpenAI intent parsing failed, executing deterministic fallback:', err.message);
      }
    }

    // Deterministic Fallback Parser
    return BuyerAgent.parseIntent(message);
  }
}

export const aiService = new AIService();
