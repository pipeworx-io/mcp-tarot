/**
 * Tarot MCP — wraps tarotapi.dev (free, no auth)
 *
 * Tools:
 * - random_card: Draw a single random tarot card
 * - draw_cards: Draw multiple random tarot cards (1-78)
 * - search_cards: Search tarot cards by keyword
 * - get_card: Get a specific tarot card by its short name (e.g. "ar01")
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://tarotapi.dev/api/v1';

type RawCard = {
  name: string;
  name_short: string;
  value: string;
  value_int: number;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  suit?: string;
  type: string;
};

type RawCardsResponse = {
  nhits: number;
  cards: RawCard[];
};

function formatCard(card: RawCard) {
  return {
    name: card.name,
    name_short: card.name_short,
    value: card.value,
    value_int: card.value_int,
    type: card.type,
    suit: card.suit ?? null,
    meaning_up: card.meaning_up,
    meaning_rev: card.meaning_rev,
    desc: card.desc,
  };
}

const tools: McpToolExport['tools'] = [
  {
    name: 'random_card',
    description: 'Draw a single random tarot card with its upright and reversed meanings.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'draw_cards',
    description: 'Draw multiple random tarot cards. Count must be between 1 and 78.',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of cards to draw (1-78).',
        },
      },
      required: ['count'],
    },
  },
  {
    name: 'search_cards',
    description: 'Search tarot cards by keyword — matches against card names and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or phrase to search for (e.g. "moon", "strength", "cups").',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_card',
    description:
      'Get a specific tarot card by its short name identifier (e.g. "ar01" for The Magician, "ar00" for The Fool, "wap01" for Ace of Wands).',
    inputSchema: {
      type: 'object',
      properties: {
        name_short: {
          type: 'string',
          description:
            'The short name identifier of the card (e.g. "ar01", "ar00", "wap01", "cup10").',
        },
      },
      required: ['name_short'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'random_card':
      return randomCard();
    case 'draw_cards':
      return drawCards(args.count as number);
    case 'search_cards':
      return searchCards(args.query as string);
    case 'get_card':
      return getCard(args.name_short as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function randomCard() {
  const res = await fetch(`${BASE_URL}/cards/random?n=1`);
  if (!res.ok) throw new Error(`Tarot API error: ${res.status}`);

  const data = (await res.json()) as RawCardsResponse;
  return formatCard(data.cards[0]);
}

async function drawCards(count: number) {
  if (count < 1 || count > 78) throw new Error('count must be between 1 and 78');

  const res = await fetch(`${BASE_URL}/cards/random?n=${count}`);
  if (!res.ok) throw new Error(`Tarot API error: ${res.status}`);

  const data = (await res.json()) as RawCardsResponse;
  return {
    count: data.nhits,
    cards: data.cards.map(formatCard),
  };
}

async function searchCards(query: string) {
  const res = await fetch(`${BASE_URL}/cards/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Tarot API error: ${res.status}`);

  const data = (await res.json()) as RawCardsResponse;
  return {
    count: data.nhits,
    cards: data.cards.map(formatCard),
  };
}

async function getCard(nameShort: string) {
  const res = await fetch(`${BASE_URL}/cards/${encodeURIComponent(nameShort)}`);
  if (!res.ok) throw new Error(`Tarot API error: ${res.status}`);

  const data = (await res.json()) as RawCardsResponse;
  if (!data.cards || data.cards.length === 0) {
    throw new Error(`No card found with name_short: ${nameShort}`);
  }
  return formatCard(data.cards[0]);
}

export default { tools, callTool } satisfies McpToolExport;
