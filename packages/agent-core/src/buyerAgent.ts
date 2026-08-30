import { ProductDto, BuyerAgentMessageResponse, MandateDto, BuyerIntent } from '@race/types';

export class BuyerAgent {
  /**
   * Parses natural language buyer prompt into structured intent
   */
  public static parseIntent(userMessage: string): BuyerIntent {
    const text = userMessage.toLowerCase();
    let category: string | undefined = undefined;
    let maxBudget: number | undefined = undefined;
    const currency = 'INR';
    let action: BuyerIntent['action'] = 'search';

    if (text.includes('keyboard')) category = 'keyboard';
    else if (text.includes('mouse')) category = 'mouse';
    else if (text.includes('headset') || text.includes('audio') || text.includes('headphone')) category = 'audio';
    else if (text.includes('wrist') || text.includes('rest')) category = 'accessories';
    else if (text.includes('hub') || text.includes('usb')) category = 'accessories';
    else if (text.includes('stand') || text.includes('lamp') || text.includes('light')) category = 'accessories';

    // Regex extract budget bounds e.g. "under 2500", "below ₹2200", "budget 3000", "upto 2800"
    const budgetMatch = text.match(/(?:under|below|max|budget|within|upto|up to|cap)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
                        text.match(/(?:₹|rs\.?)\s*(\d+)/i);
    if (budgetMatch && budgetMatch[1]) {
      maxBudget = parseInt(budgetMatch[1], 10);
    }

    if (text.includes('buy') || text.includes('purchase') || text.includes('order') || text.includes('checkout')) {
      action = 'purchase';
    } else if (text.includes('compare') || text.includes('vs') || text.includes('difference')) {
      action = 'compare';
    }

    return {
      rawQuery: userMessage,
      category,
      maxBudget,
      currency,
      action,
      tool: action === 'purchase' ? 'commerce.checkout' : (action === 'compare' ? 'catalog.compare' : 'catalog.search')
    };
  }

  /**
   * Evaluates catalog against extracted intent and formulates bounded conversational responses
   */
  public static processMessage(
    userMessage: string,
    catalog: ProductDto[],
    currentMandate?: MandateDto,
    explicitIntent?: BuyerIntent
  ): BuyerAgentMessageResponse {
    const intent = explicitIntent || this.parseIntent(userMessage);

    // Filter catalog for active and agent purchasable items
    let matched = catalog.filter(p => p.active && p.agentPurchasable);

    if (intent.category) {
      matched = matched.filter(p => p.category.toLowerCase().includes(intent.category!.toLowerCase()));
    }

    if (intent.maxBudget) {
      matched = matched.filter(p => p.price <= intent.maxBudget!);
    }

    // Sort by value (best match / highest price within budget)
    matched.sort((a, b) => b.price - a.price);

    if (matched.length === 0) {
      return {
        message: `I searched the machine-readable catalog for **${intent.category || 'products'}** ${intent.maxBudget ? `under ₹${intent.maxBudget}` : ''}, but found no active in-stock items matching those bounds. Would you like me to broaden the budget or search adjacent categories?`,
        intentSummary: {
          category: intent.category,
          maxBudget: intent.maxBudget,
          currency: 'INR',
          action: intent.action,
          tool: intent.tool
        },
        products: [],
        suggestedAction: 'CLARIFY'
      };
    }

    const topProduct = matched[0];

    // Build comparison if multiple candidates match
    let comparison = undefined;
    if (matched.length > 1) {
      comparison = {
        recommendation: `Recommended: **${topProduct.name}** at ₹${topProduct.price}. It offers the best balance of features within your ₹${intent.maxBudget || topProduct.price + 500} budget limit.`,
        topChoiceId: topProduct.id,
        keyDifferences: matched.slice(0, 3).map(p => `${p.name} (₹${p.price}) - ${p.description}`)
      };
    }

    // Check if mandate is available and covers the top product
    let suggestedAction: 'CREATE_MANDATE' | 'PROCEED_CHECKOUT' | 'CLARIFY' | 'BLOCKED' = 'CREATE_MANDATE';
    if (currentMandate && currentMandate.status === 'ACTIVE') {
      if (topProduct.price <= currentMandate.maxAmount) {
        suggestedAction = 'PROCEED_CHECKOUT';
      } else {
        suggestedAction = 'BLOCKED';
      }
    }

    const message = `I discovered **${matched.length} product${matched.length > 1 ? 's' : ''}** matching your criteria. I've formulated a bounded purchase proposal for **${topProduct.name}** at **₹${topProduct.price}** (within your budget limit of ₹${intent.maxBudget || currentMandate?.maxAmount || 2500}).`;

    return {
      message,
      intentSummary: {
        category: intent.category || topProduct.category,
        maxBudget: intent.maxBudget || currentMandate?.maxAmount || 2500,
        currency: 'INR',
        action: intent.action,
        tool: intent.tool
      },
      products: matched,
      comparison,
      mandate: currentMandate,
      suggestedAction
    };
  }
}
