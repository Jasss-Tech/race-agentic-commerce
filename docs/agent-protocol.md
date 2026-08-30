# RACE Agent Commerce Protocol (RACE-ACP v1.0)

## 1. Specification Overview

The **RACE Agent Commerce Protocol (RACE-ACP)** defines the standard schema for machine-readable commerce feeds, intent mandates, and structured tool execution across agentic marketplaces.

---

## 2. Machine-Readable Product Feed (`/api/catalog/agent-feed`)

```json
{
  "protocol": "RACE-ACP/v1.0",
  "generated_at": "2026-08-28T11:00:00.000Z",
  "products": [
    {
      "product_id": "prod_keyboard_01",
      "merchant_id": "merch_technova",
      "merchant_name": "TechNova Gear",
      "name": "TechNova Mechanical Keyboard",
      "category": "keyboard",
      "pricing": {
        "amount": 2199,
        "currency": "INR"
      },
      "availability": {
        "in_stock": true,
        "quantity": 42
      },
      "attributes": {
        "connection": "wireless",
        "switch": "mechanical-red",
        "layout": "75%",
        "rgb": true
      },
      "commerce": {
        "purchasable_by_agent": true,
        "returnable": true,
        "return_policy": "7-day replacement",
        "max_delegated_quantity": 5
      }
    }
  ]
}
```

---

## 3. Intent Mandate Schema (`/api/mandates`)

```json
{
  "mandate_id": "mnt_8910ac",
  "user_id": "usr_buyer_001",
  "agent_id": "buyer_agent",
  "merchant_id": "merch_technova",
  "intent": "purchase",
  "max_amount": 2500,
  "currency": "INR",
  "allowed_categories": ["keyboard", "accessories"],
  "allowed_actions": ["search", "compare", "purchase"],
  "confirmation_required": false,
  "status": "ACTIVE",
  "expires_at": "2026-08-28T13:00:00.000Z"
}
```

---

## 4. Structured Tool Contracts

### `search_catalog`
```json
{
  "query": "mechanical keyboard",
  "category": "keyboard",
  "maxPrice": 2500,
  "currency": "INR"
}
```

### `request_checkout`
```json
{
  "mandateId": "mnt_8910ac",
  "productId": "prod_keyboard_01",
  "quantity": 1,
  "expectedPrice": 2199,
  "idempotencyKey": "race_chk_001"
}
```
