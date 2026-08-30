export interface AIProvider {
  name: string;
  generateText(prompt: string, context?: Record<string, unknown>): Promise<string>;
  generateStructured<T>(prompt: string, schemaDescription: string): Promise<T>;
}

export class DeterministicAIProvider implements AIProvider {
  name = 'deterministic-commerce-simulation-engine';

  async generateText(prompt: string): Promise<string> {
    return `Processed with deterministic intent engine: "${prompt.slice(0, 80)}"`;
  }

  async generateStructured<T>(prompt: string, _schemaDescription: string): Promise<T> {
    const lower = prompt.toLowerCase();
    const result: Record<string, unknown> = {
      action: 'search',
      currency: 'INR'
    };

    if (lower.includes('keyboard')) {
      result.category = 'keyboard';
      result.maxBudget = 2500;
    } else if (lower.includes('mouse')) {
      result.category = 'mouse';
      result.maxBudget = 1500;
    } else if (lower.includes('headset') || lower.includes('audio') || lower.includes('headphone')) {
      result.category = 'audio';
      result.maxBudget = 3000;
    } else if (lower.includes('hub') || lower.includes('usb')) {
      result.category = 'accessories';
      result.maxBudget = 1500;
    } else if (lower.includes('wrist') || lower.includes('rest')) {
      result.category = 'accessories';
      result.maxBudget = 800;
    }

    if (lower.includes('buy') || lower.includes('purchase') || lower.includes('checkout') || lower.includes('order')) {
      result.action = 'purchase';
    } else if (lower.includes('compare') || lower.includes('vs')) {
      result.action = 'compare';
    }

    return result as T;
  }
}
