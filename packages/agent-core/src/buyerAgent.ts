import {
  ProductDto,
  ProductMatchDto,
  BuyerAgentMessageResponse,
  MandateDto,
  BuyerIntent,
  BuyerIntentType,
  CartActionPayload
} from '@race/types';

export interface BuyerSessionContext {
  lastShownProductIds?: string[];
  selectedProductId?: string;
  cartItems?: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  mandateCap?: number;
  conversationHistory?: Array<{ sender: 'user' | 'agent'; text: string }>;
}

export class BuyerAgent {
  /**
   * Parses natural language buyer prompt into structured intent with conversational context
   */
  public static parseIntent(userMessage: string, context?: BuyerSessionContext): BuyerIntent {
    const text = userMessage.trim().toLowerCase();
    let category: string | undefined = undefined;
    let maxBudget: number | undefined = undefined;
    const currency = 'INR';
    let intentType: BuyerIntentType = 'UNKNOWN';
    let action: BuyerIntent['action'] = 'search';
    let tool: string | undefined = 'catalog.search';
    let useCase: BuyerIntent['useCase'] = undefined;
    let targetProductIndex: number | undefined = undefined;
    let targetProductId: string | undefined = undefined;
    let quantity: number = 1;
    let comparisonProductIds: string[] | undefined = undefined;

    // 1. Detect Category
    if (text.includes('keyboard') || text.includes('keeb') || text.includes('keycap')) {
      category = 'keyboard';
    } else if (text.includes('mouse') || text.includes('mice') || text.includes('trackball') || text.includes('trackpad')) {
      category = 'mouse';
    } else if (text.includes('headset') || text.includes('audio') || text.includes('headphone') || text.includes('earphone') || text.includes('sound')) {
      category = 'audio';
    } else if (text.includes('webcam') || text.includes('camera') || text.includes('streamcam')) {
      category = 'webcam';
    } else if (text.includes('monitor') || text.includes('display') || text.includes('screen') || text.includes('arm')) {
      category = 'monitors';
    } else if (text.includes('wrist') || text.includes('rest') || text.includes('hub') || text.includes('dock') || text.includes('stand') || text.includes('mat') || text.includes('pad') || text.includes('charger') || text.includes('light') || text.includes('accessory') || text.includes('accessories')) {
      category = 'accessories';
    }

    // 2. Detect Use Case
    if (text.includes('game') || text.includes('gaming') || text.includes('esport') || text.includes('rgb')) {
      useCase = 'gaming';
    } else if (text.includes('office') || text.includes('work') || text.includes('typing') || text.includes('quiet') || text.includes('silent')) {
      useCase = 'office';
    } else if (text.includes('program') || text.includes('code') || text.includes('coding') || text.includes('developer')) {
      useCase = 'programming';
    }

    // 3. Extract Budget Bounds (e.g., "under 2500", "below ₹2200", "budget 3000", "upto 2800", "within 2500")
    const budgetMatch =
      text.match(/(?:under|below|max|budget|within|upto|up to|cap|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
      text.match(/(?:₹|rs\.?)\s*(\d+)/i);
    if (budgetMatch && budgetMatch[1]) {
      maxBudget = parseInt(budgetMatch[1], 10);
    }

    // 4. Relative "Cheaper" Request
    const isCheaper = text.includes('cheaper') || text.includes('lower price') || text.includes('less expensive') || text.includes('make it cheaper') || text.includes('cheapest');
    if (isCheaper && !maxBudget && context?.lastShownProductIds && context.lastShownProductIds.length > 0) {
      // Intent signifies finding a cheaper alternative
      maxBudget = 2000;
    }

    // 5. Extract Quantity
    const qtyMatch = text.match(/(?:qty|quantity|\b)\s*(\d+)\s*(?:x|units|pieces|of them)?/i);
    if (qtyMatch && qtyMatch[1] && parseInt(qtyMatch[1], 10) > 0 && parseInt(qtyMatch[1], 10) < 50) {
      const parsedQty = parseInt(qtyMatch[1], 10);
      if (parsedQty !== maxBudget) {
        quantity = parsedQty;
      }
    }

    // 6. Detect Relative References ("the first one", "the second one", "1st", "2nd", "the third one")
    if (text.includes('first') || text.includes('1st') || text.includes('option 1') || text.includes('top one')) {
      targetProductIndex = 0;
    } else if (text.includes('second') || text.includes('2nd') || text.includes('option 2') || text.includes('next one')) {
      targetProductIndex = 1;
    } else if (text.includes('third') || text.includes('3rd') || text.includes('option 3')) {
      targetProductIndex = 2;
    }

    // Resolve target product ID from session context if index is matched
    if (targetProductIndex !== undefined && context?.lastShownProductIds && context.lastShownProductIds[targetProductIndex]) {
      targetProductId = context.lastShownProductIds[targetProductIndex];
    } else if (context?.selectedProductId && (text.includes('this') || text.includes('that') || text.includes('it'))) {
      targetProductId = context.selectedProductId;
    }

    // 7. Intent Classification Hierarchy

    const isGreeting = /^(hi|hello|hey|heya|namaste|hola|good morning|good afternoon|good evening|sup|yo)\b/i.test(text) &&
      !text.includes('keyboard') && !text.includes('mouse') && !text.includes('under') && !text.includes('buy');

    const isSmallTalk =
      text.includes('how are you') ||
      text.includes('who are you') ||
      text.includes('what can you do') ||
      text.includes('what are you') ||
      text.includes('tell me about yourself') ||
      text.includes('thank you') ||
      text.includes('thanks') ||
      text.includes('good job') ||
      text.includes('awesome') ||
      text.includes('cool') ||
      text === 'ok' ||
      text === 'okay' ||
      text === 'nice';

    // CART OPERATIONS
    const isCartView = text.includes('what is in my cart') || text.includes("what's in my cart") || text.includes('show cart') || text.includes('view cart') || text.includes('my cart') || text === 'cart' || text.includes('cart cost') || text.includes('how much in my cart');
    const isCartRemove = (text.includes('remove') || text.includes('delete') || text.includes('drop') || text.includes('clear')) && (text.includes('cart') || text.includes('from cart') || text.includes('hub') || text.includes('keyboard') || text.includes('item') || text.includes('that') || text.includes('it'));
    const isCartUpdate = (text.includes('increase') || text.includes('decrease') || text.includes('change quantity') || text.includes('make it') || text.includes('qty')) && (text.includes('cart') || text.includes('quantity') || text.includes('units'));
    const isCartAdd = (text.includes('add') || text.includes('put in') || text.includes('save to')) && (text.includes('cart') || text.includes('it') || text.includes('this') || targetProductIndex !== undefined || text.includes('first') || text.includes('second') || text.includes('keyboard') || text.includes('mouse') || text.includes('rest') || text.includes('hub'));

    // COMPARISON
    const isComparison = text.includes('compare') || text.includes(' vs ') || text.includes('versus') || text.includes('difference between') || text.includes('which is better') || text.includes('which one is quieter') || text.includes('which one should i buy');

    // CHECKOUT / PURCHASE
    const isCheckout = text.includes('checkout') || text.includes('proceed to checkout') || text.includes('ready to pay') || text.includes('place order') || text.includes('finalize purchase') || (text.includes('buy') && !text.includes('which one should i buy')) || text.includes('purchase');

    // HELP
    const isHelp = text.includes('help') || text.includes('commands') || text.includes('what should i ask') || text.includes('guide');

    // AFFORDABILITY / MANDATE
    const isAffordability = text.includes('can i afford') || text.includes('can i buy it automatically') || text.includes('within my mandate') || text.includes('within mandate') || text.includes('how much can i spend');

    // Assign Primary Intent Type
    if (isGreeting) {
      intentType = 'GREETING';
      action = 'chat';
      tool = undefined;
    } else if (isSmallTalk) {
      intentType = 'SMALL_TALK';
      action = 'chat';
      tool = undefined;
    } else if (isHelp) {
      intentType = 'HELP';
      action = 'inquire';
      tool = undefined;
    } else if (isCartRemove) {
      intentType = 'CART_REMOVE';
      action = 'cart';
      tool = 'cart.remove';
    } else if (isCartUpdate) {
      intentType = 'CART_UPDATE';
      action = 'cart';
      tool = 'cart.update';
    } else if (isCartAdd) {
      intentType = 'CART_ADD';
      action = 'cart';
      tool = 'cart.add';
    } else if (isCartView) {
      intentType = 'CART_VIEW';
      action = 'cart';
      tool = 'cart.view';
    } else if (isCheckout) {
      intentType = 'PURCHASE_REQUEST';
      action = 'purchase';
      tool = 'commerce.checkout';
    } else if (isComparison) {
      intentType = 'PRODUCT_COMPARISON';
      action = 'compare';
      tool = 'catalog.compare';
    } else if (isAffordability) {
      intentType = 'BUDGET_QUERY';
      action = 'inquire';
      tool = 'mandate.check';
    } else if (category || maxBudget || useCase || text.includes('search') || text.includes('find') || text.includes('show') || text.includes('looking for') || text.includes('best') || text.includes('recommend') || isCheaper) {
      intentType = (text.includes('best') || text.includes('recommend') || text.includes('suggest')) ? 'PRODUCT_RECOMMENDATION' : 'PRODUCT_SEARCH';
      action = 'search';
      tool = 'catalog.search';
    } else {
      intentType = 'UNKNOWN';
      action = 'search';
      tool = 'catalog.search';
    }

    return {
      rawQuery: userMessage,
      intentType,
      category,
      maxBudget,
      currency,
      action,
      tool,
      useCase,
      targetProductIndex,
      targetProductId,
      quantity,
      comparisonProductIds
    };
  }

  /**
   * Calculates a transparent, multi-factor AI match score (0–100%) and reasons based on real attributes
   */
  public static calculateMatchScore(
    product: ProductDto,
    intent: BuyerIntent,
    mandateCap?: number
  ): { score: number; reasons: string[] } {
    let score = 60; // base score for catalog presence
    const reasons: string[] = [];
    const budget = intent.maxBudget || mandateCap || 25000;
    const attrs = (product.attributes || {}) as Record<string, any>;

    // 1. Budget Fit (+25 pts max)
    if (product.price <= budget) {
      const priceUtilization = Math.round((product.price / budget) * 15);
      score += 20 + priceUtilization;
      reasons.push(`Within your ₹${budget.toLocaleString('en-IN')} budget`);
    } else {
      const overBudgetPct = ((product.price - budget) / budget) * 100;
      score -= Math.min(35, Math.round(overBudgetPct / 2));
      reasons.push(`₹${(product.price - budget).toLocaleString('en-IN')} above your ₹${budget.toLocaleString('en-IN')} target`);
    }

    // 2. Category / Intent Match (+15 pts)
    const prodCategory = (product.category || '').toLowerCase();
    if (intent.category && prodCategory.includes(intent.category.toLowerCase())) {
      score += 15;
      reasons.push(`Direct match for ${product.category} category`);
    }

    // 3. Use Case Match (+10 pts)
    if (intent.useCase) {
      const bestFor = String(attrs.bestFor || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      if (bestFor.includes(intent.useCase) || desc.includes(intent.useCase)) {
        score += 10;
        reasons.push(`Optimized for ${intent.useCase} usage`);
      }
    }

    // 4. Rating & Reviews (+10 pts)
    const rating = Number(attrs.rating) || 4.5;
    if (rating >= 4.8) {
      score += 10;
      reasons.push(`Top-rated (${rating}★ customer satisfaction)`);
    } else if (rating >= 4.5) {
      score += 5;
    }

    // 5. In Stock (+5 pts)
    if (product.stock > 10) {
      score += 5;
      reasons.push('Currently in stock and ready to ship');
    }

    score = Math.max(30, Math.min(99, score));

    return { score, reasons: reasons.slice(0, 4) };
  }

  /**
   * Main conversational dispatch pipeline with multi-turn context
   */
  public static processMessage(
    userMessage: string,
    catalog: ProductDto[],
    mandate?: MandateDto,
    providedIntent?: BuyerIntent,
    sessionContext?: BuyerSessionContext
  ): BuyerAgentMessageResponse {
    const intent = providedIntent || this.parseIntent(userMessage, sessionContext);
    const mandateCap = mandate?.maxAmount || sessionContext?.mandateCap || 25000;

    // -------------------------------------------------------------
    // 1. GREETING & SMALL TALK
    // -------------------------------------------------------------
    if (intent.intentType === 'GREETING') {
      return {
        message: `Welcome to **TechNova Store**! I am your **RACE AI Shopping Copilot**. I can help you discover mechanical keyboards, wireless mice, ANC headphones, 4K webcams, and workspace accessories — all bounded by your active mandate (₹${mandateCap.toLocaleString('en-IN')}).\n\nHow can I help you upgrade your desk setup today?`,
        intentType: 'GREETING',
        intentSummary: { action: 'chat', intentType: 'GREETING' },
        products: [],
        suggestedAction: 'NONE',
        quickReplies: ['Keyboards under ₹2500', 'Best wireless mouse', 'Compare keyboards', 'Workspace accessories']
      };
    }

    if (intent.intentType === 'SMALL_TALK') {
      return {
        message: `I'm doing great and operating normally! You have **${catalog.length} products** in the verified TechNova catalog and an active authorization cap of **₹${mandateCap.toLocaleString('en-IN')}**.\n\nHow can I help you find or compare products today?`,
        intentType: 'SMALL_TALK',
        intentSummary: { action: 'chat', intentType: 'SMALL_TALK' },
        products: [],
        suggestedAction: 'NONE',
        quickReplies: ['Show top keyboards', 'Ergonomic mice', 'Compare top 3 SKUs']
      };
    }

    if (intent.intentType === 'HELP') {
      return {
        message: `Here are some things you can ask me:\n• *"Find a wireless keyboard under ₹2500"*\n• *"Show me ergonomic mice for office work"*\n• *"Compare the first and second keyboards"*\n• *"Add the second one to my cart"*\n• *"What's in my cart and can I afford it?"*\n• *"Show me something cheaper"*`,
        intentType: 'HELP',
        intentSummary: { action: 'inquire', intentType: 'HELP' },
        products: [],
        suggestedAction: 'NONE',
        quickReplies: ['Mechanical keyboards', 'Wireless mice', 'ANC Headphones', 'USB-C Docks']
      };
    }

    // -------------------------------------------------------------
    // 2. CART VIEW & BUDGET INQUIRY
    // -------------------------------------------------------------
    if (intent.intentType === 'CART_VIEW' || intent.intentType === 'BUDGET_QUERY') {
      const items = sessionContext?.cartItems || [];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = subtotal > 3000 ? Math.round(subtotal * 0.05) : 0;
      const shipping = subtotal > 1500 ? 0 : 99;
      const total = items.length > 0 ? Math.max(0, subtotal - discount + shipping) : 0;
      const remainingBalance = Math.max(0, mandateCap - total);
      const isOverLimit = total > mandateCap;
      const overAmount = isOverLimit ? total - mandateCap : 0;

      if (items.length === 0) {
        return {
          message: `Your shopping cart is currently empty. You have **₹${mandateCap.toLocaleString('en-IN')}** available in your authorized spending mandate.\n\nWould you like me to recommend top-rated keyboards or ergonomic mice?`,
          intentType: 'CART_VIEW',
          intentSummary: { action: 'cart', intentType: 'CART_VIEW' },
          cartSummary: { itemCount: 0, subtotal: 0, discount: 0, total: 0, mandateCap, remainingBalance: mandateCap, isOverLimit: false, overAmount: 0 },
          products: [],
          quickReplies: ['Show keyboards under ₹2500', 'Show wireless mice', 'Show accessories']
        };
      }

      const itemList = items.map(i => `• **${i.productName}** (${i.quantity}x) — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
      const statusMsg = isOverLimit
        ? `⚠️ Your cart total is ₹${overAmount.toLocaleString('en-IN')} above your ₹${mandateCap.toLocaleString('en-IN')} authorization limit. You can pay directly via **Razorpay Test Mode** or adjust your mandate.`
        : `✓ Your cart is fully within your ₹${mandateCap.toLocaleString('en-IN')} mandate limit with **₹${remainingBalance.toLocaleString('en-IN')}** remaining headroom.`;

      return {
        message: `Here is your current cart snapshot:\n\n${itemList}\n\n**Total Payable:** ₹${total.toLocaleString('en-IN')} INR\n${statusMsg}`,
        intentType: 'CART_VIEW',
        intentSummary: { action: 'cart', intentType: 'CART_VIEW' },
        cartSummary: { itemCount: items.length, subtotal, discount, total, mandateCap, remainingBalance, isOverLimit, overAmount },
        products: [],
        suggestedAction: isOverLimit ? 'BLOCKED' : 'PROCEED_CHECKOUT',
        quickReplies: ['Proceed to Checkout', 'Add an accessory', 'Show keyboards']
      };
    }

    // -------------------------------------------------------------
    // 3. CART ADD / REMOVE OPERATIONS
    // -------------------------------------------------------------
    if (intent.intentType === 'CART_ADD') {
      let productToAdd: ProductDto | undefined = undefined;

      // 1. By direct target product ID
      if (intent.targetProductId) {
        productToAdd = catalog.find(p => p.id === intent.targetProductId);
      }

      // 2. By target product index from last shown products
      if (!productToAdd && intent.targetProductIndex !== undefined && sessionContext?.lastShownProductIds) {
        const pId = sessionContext.lastShownProductIds[intent.targetProductIndex];
        if (pId) {
          productToAdd = catalog.find(p => p.id === pId);
        }
      }

      // 3. By selected product
      if (!productToAdd && sessionContext?.selectedProductId) {
        productToAdd = catalog.find(p => p.id === sessionContext.selectedProductId);
      }

      // 4. Fallback search by category
      if (!productToAdd) {
        const cat = intent.category || 'keyboard';
        productToAdd = catalog.find(p => p.category.toLowerCase().includes(cat.toLowerCase()) && p.active && p.agentPurchasable);
      }

      if (productToAdd) {
        const cartAction: CartActionPayload = {
          type: 'ADD_TO_CART',
          productId: productToAdd.id,
          productName: productToAdd.name,
          quantity: intent.quantity || 1
        };

        const isOver = productToAdd.price > mandateCap;
        const msg = isOver
          ? `Added **${productToAdd.name}** to your cart (₹${productToAdd.price.toLocaleString('en-IN')}). Note: This item exceeds your ₹${mandateCap.toLocaleString('en-IN')} mandate limit, so manual Razorpay payment will be required at checkout.`
          : `✓ Added **${productToAdd.name}** (${intent.quantity || 1}x) to your delegated cart at **₹${productToAdd.price.toLocaleString('en-IN')}**. Fully authorized within your spending mandate.`;

        return {
          message: msg,
          intentType: 'CART_ADD',
          intentSummary: { action: 'cart', intentType: 'CART_ADD' },
          cartAction,
          products: [productToAdd],
          suggestedAction: 'CART_UPDATED',
          quickReplies: ['View Cart & Checkout', 'Add wrist rest (₹499)', 'Continue shopping']
        };
      }
    }

    if (intent.intentType === 'CART_REMOVE') {
      const items = sessionContext?.cartItems || [];
      const rawLower = userMessage.toLowerCase();
      const itemToRemove = items.find(i =>
        (intent.targetProductId && i.productId === intent.targetProductId) ||
        rawLower.includes(i.productName.toLowerCase()) ||
        rawLower.includes(i.productId.toLowerCase()) ||
        i.productName.toLowerCase().split(/\s+/).some(w => w.length >= 3 && rawLower.includes(w)) ||
        (intent.category && i.productName.toLowerCase().includes(intent.category))
      ) || items[0];

      if (itemToRemove) {
        const cartAction: CartActionPayload = {
          type: 'REMOVE_FROM_CART',
          productId: itemToRemove.productId,
          productName: itemToRemove.productName,
          quantity: 0
        };

        return {
          message: `Removed **${itemToRemove.productName}** from your shopping cart.`,
          intentType: 'CART_REMOVE',
          intentSummary: { action: 'cart', intentType: 'CART_REMOVE' },
          cartAction,
          suggestedAction: 'CART_UPDATED',
          quickReplies: ['View Cart', 'Find another product', 'Proceed to Checkout']
        };
      }
    }

    // -------------------------------------------------------------
    // 4. PRODUCT COMPARISON (Dynamic Spec Matrix)
    // -------------------------------------------------------------
    if (intent.intentType === 'PRODUCT_COMPARISON') {
      let candidates: ProductDto[] = [];

      // 1. From session context last shown
      if (sessionContext?.lastShownProductIds && sessionContext.lastShownProductIds.length >= 2) {
        candidates = sessionContext.lastShownProductIds
          .map(id => catalog.find(p => p.id === id))
          .filter(Boolean) as ProductDto[];
      }

      // 2. If filtered by category
      if (candidates.length < 2) {
        const cat = intent.category || 'keyboard';
        candidates = catalog.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
      }

      if (candidates.length >= 2) {
        const compareSlice = candidates.slice(0, 3);
        const prodA = compareSlice[0];
        const prodB = compareSlice[1];
        const prodC = compareSlice[2];

        const buildRowValues = (getter: (p: ProductDto) => string) => {
          const res: Record<string, string> = {};
          compareSlice.forEach(p => {
            res[p.name] = getter(p);
          });
          return res;
        };

        const matrix = [
          { attribute: 'Price', values: buildRowValues(p => `₹${p.price.toLocaleString('en-IN')}`) },
          { attribute: 'Category', values: buildRowValues(p => p.category.toUpperCase()) },
          {
            attribute: 'Key Connectivity',
            values: buildRowValues(p => String((p.attributes as any)?.connection || (p.attributes as any)?.connectivity || 'Wired USB-C'))
          },
          {
            attribute: 'Switch / Sensor / Driver',
            values: buildRowValues(p => String((p.attributes as any)?.switch || (p.attributes as any)?.sensor || (p.attributes as any)?.driver || (p.attributes as any)?.resolution || (p.attributes as any)?.ports || (p.attributes as any)?.panel || 'Tactile'))
          },
          {
            attribute: 'Battery Life',
            values: buildRowValues(p => String((p.attributes as any)?.battery || (p.attributes as any)?.power || 'Passive / Bus Powered'))
          },
          {
            attribute: 'Weight & Size',
            values: buildRowValues(p => `${(p.attributes as any)?.weight || 'N/A'} · ${(p.attributes as any)?.dimensions || 'Compact'}`)
          },
          {
            attribute: 'Compatibility',
            values: buildRowValues(p => String((p.attributes as any)?.compatibility || 'Windows, macOS, Linux'))
          },
          {
            attribute: 'Rating & Reviews',
            values: buildRowValues(p => `★ ${(p.attributes as any)?.rating || 4.7} (${(p.attributes as any)?.reviewsCount || 150} reviews)`)
          },
          {
            attribute: 'Best For',
            values: buildRowValues(p => String((p.attributes as any)?.bestFor || 'General Productivity'))
          },
          {
            attribute: 'Key Strength',
            values: buildRowValues(p => String((p.attributes as any)?.keyStrength || 'Balanced value and reliability'))
          },
          {
            attribute: 'Main Tradeoff',
            values: buildRowValues(p => String((p.attributes as any)?.mainTradeoff || 'None'))
          }
        ];

        const verdict = prodA.price <= mandateCap
          ? `**AI Recommendation:** **${prodA.name}** (₹${prodA.price.toLocaleString('en-IN')}) is the best overall choice because it fits fully within your ₹${mandateCap.toLocaleString('en-IN')} mandate limit while delivering ${(prodA.attributes as any)?.keyStrength || 'solid performance'}. **${prodB.name}** (₹${prodB.price.toLocaleString('en-IN')}) offers ${(prodB.attributes as any)?.keyStrength || 'higher-end specifications'}, but requires evaluating your budget.`
          : `**AI Recommendation:** Both models offer strong ergonomics. **${prodA.name}** provides the best price-to-performance ratio.`;

        return {
          message: `I've prepared a comprehensive technical comparison between **${compareSlice.map(p => p.name).join('**, **')}**:\n\n${verdict}`,
          intentType: 'PRODUCT_COMPARISON',
          intentSummary: { action: 'compare', intentType: 'PRODUCT_COMPARISON', category: intent.category },
          products: compareSlice.map(p => {
            const { score, reasons } = this.calculateMatchScore(p, intent, mandateCap);
            return { ...p, aiMatchScore: score, matchReasons: reasons, isOverMandate: p.price > mandateCap };
          }),
          comparison: {
            recommendation: verdict,
            topChoiceId: prodA.id,
            keyDifferences: compareSlice.map(p => `${p.name}: ₹${p.price.toLocaleString('en-IN')} · ${(p.attributes as any)?.keyStrength || p.description}`),
            matrix,
            verdict
          },
          suggestedAction: prodA.price <= mandateCap ? 'PROCEED_CHECKOUT' : 'BLOCKED',
          quickReplies: [`Add ${prodA.name.split(' ')[0]} to Cart`, `Add ${prodB.name.split(' ')[0]} to Cart`, 'View Full Comparison']
        };
      }
    }

    // -------------------------------------------------------------
    // 5. PRODUCT SEARCH & RECOMMENDATION ENGINE
    // -------------------------------------------------------------
    let matched = catalog.filter(p => p.active && p.agentPurchasable);

    // Filter by category if specified
    if (intent.category) {
      matched = matched.filter(p => p.category.toLowerCase().includes(intent.category!.toLowerCase()));
    } else {
      // Keyword matching when no category was specified
      const rawLower = userMessage.toLowerCase();
      const nonSearchWords = new Set(['show', 'find', 'me', 'the', 'a', 'an', 'some', 'any', 'products', 'items', 'do', 'you', 'have', 'i', 'want', 'need', 'looking', 'for', 'under', 'below', 'please', 'with', 'and', 'or', 'can', 'something', 'alternative']);
      const queryWords = rawLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length >= 3 && !nonSearchWords.has(w));

      if (queryWords.length > 0) {
        matched = matched.filter(p => {
          const pText = `${p.name} ${p.description} ${p.category} ${JSON.stringify(p.attributes || {})}`.toLowerCase();
          return queryWords.some(w => pText.includes(w));
        });
      }
    }

    // Filter by budget if specified
    if (intent.maxBudget) {
      const inBudget = matched.filter(p => p.price <= intent.maxBudget!);
      if (inBudget.length > 0) {
        matched = inBudget;
      }
    }

    // Wireless filter
    if (userMessage.toLowerCase().includes('wireless')) {
      const wirelessOnly = matched.filter(p => {
        const conn = String((p.attributes as any)?.connection || (p.attributes as any)?.connectivity || '').toLowerCase();
        return conn.includes('wireless') || conn.includes('bluetooth') || conn.includes('2.4g');
      });
      if (wirelessOnly.length > 0) matched = wirelessOnly;
    }

    // Rank products using multi-factor AI match score
    const scoredProducts: ProductMatchDto[] = matched.map(p => {
      const { score, reasons } = this.calculateMatchScore(p, intent, mandateCap);
      const isOverMandate = p.price > mandateCap;
      const isOverBudget = intent.maxBudget ? p.price > intent.maxBudget : false;
      return {
        ...p,
        aiMatchScore: score,
        matchReasons: reasons,
        isOverMandate,
        isOverBudget
      };
    });

    // Sort by AI Match Score descending
    scoredProducts.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));

    if (scoredProducts.length === 0) {
      return {
        message: `I searched the verified catalog for **${intent.category || 'products'}** ${intent.maxBudget ? `under ₹${intent.maxBudget.toLocaleString('en-IN')}` : ''}, but found no matching active items. Would you like me to broaden the budget or search adjacent workspace categories?`,
        intentType: 'PRODUCT_SEARCH',
        intentSummary: {
          category: intent.category,
          maxBudget: intent.maxBudget,
          currency: 'INR',
          action: intent.action,
          tool: intent.tool
        },
        products: [],
        suggestedAction: 'CLARIFY',
        quickReplies: ['Show all keyboards', 'Show accessories under ₹1000', 'Increase budget']
      };
    }

    const topProduct = scoredProducts[0];
    const isTopOverMandate = topProduct.price > mandateCap;

    let message = '';
    if (isTopOverMandate) {
      message = `I discovered **${scoredProducts.length} product${scoredProducts.length > 1 ? 's' : ''}** matching "${userMessage}".\n\n⚠️ **${topProduct.name}** is priced at **₹${topProduct.price.toLocaleString('en-IN')}**, which exceeds your active **₹${mandateCap.toLocaleString('en-IN')}** mandate cap. I have ranked the in-budget options below.`;
    } else {
      message = `I found **${scoredProducts.length} product${scoredProducts.length > 1 ? 's' : ''}** matching your request. Top recommendation: **${topProduct.name}** at **₹${topProduct.price.toLocaleString('en-IN')}** (${topProduct.aiMatchScore}% AI Match — within your ₹${mandateCap.toLocaleString('en-IN')} mandate limit).`;
    }

    let comparison = undefined;
    if (scoredProducts.length > 1) {
      const topChoice = scoredProducts[0];
      const secondChoice = scoredProducts[1];
      comparison = {
        recommendation: `Recommended: **${topChoice.name}** at ₹${topChoice.price.toLocaleString('en-IN')} (${topChoice.aiMatchScore}% match). ${(topChoice.attributes as any)?.keyStrength || 'Balanced specs and value.'}`,
        topChoiceId: topChoice.id,
        keyDifferences: scoredProducts.slice(0, 3).map(p => `${p.name} (₹${p.price.toLocaleString('en-IN')}) — ${(p.attributes as any)?.keyStrength || p.description}`)
      };
    }

    const suggestedAction = isTopOverMandate ? 'BLOCKED' : (mandate ? 'PROCEED_CHECKOUT' : 'CREATE_MANDATE');

    return {
      message,
      intentType: intent.intentType || 'PRODUCT_SEARCH',
      intentSummary: {
        category: intent.category || topProduct.category,
        maxBudget: intent.maxBudget || mandateCap,
        currency: 'INR',
        action: intent.action,
        tool: intent.tool
      },
      products: scoredProducts.slice(0, 6),
      comparison,
      suggestedAction,
      quickReplies: [
        `Add ${topProduct.name.split(' ')[0]} to Cart`,
        'Compare top choices',
        'Show me something cheaper',
        "What's in my cart?"
      ]
    };
  }
}
