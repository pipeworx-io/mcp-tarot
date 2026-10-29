# @pipeworx/tarot

Draws, searches and spreads from an original 78-card tarot deck written for
this pack, with seeded/reproducible randomness, optional card reversals, named
spreads, and stateful shuffle sessions.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1857+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## What changed

This pack no longer calls tarotapi.dev. The 78-card deck — every card's name,
keywords, upright/reversed meaning and image description — is written for
this pack and shipped inline (`src/deck.ts`, ~46 KB); nothing is fetched at
call time. `random_card` and `draw_cards` keep their original argument shapes
and gain `seed`, `reversals`, and `session_id`. Two tools are new:
`tarot_spread` (named layouts) and `tarot_shuffle` (sessions).

## Tools

- `random_card(seed?, reversals?, session_id?)` — draws one card. Returns the
  card, its orientation (upright/reversed — a 50% coin flip unless
  `reversals: false`), the traditional meaning for that orientation, and the
  seed used (pass it back to reproduce the exact draw).
- `draw_cards(count, seed?, reversals?, session_id?)` — draws 1–78 cards the
  same way. (The gateway exposes this tool as `tarot_draw_cards` when it
  collides with another pack's `draw_cards`; the pack-local name stays
  `draw_cards`.)
- `search_cards(query)` — searches the deck by card name, suit, or keyword
  (either orientation). A query that matches nothing is a loud error, not an
  empty list.
- `get_card(name_short)` — looks up one card by id (`major_00`..`major_21`,
  `wands_01`..`pentacles_14`) or exact name (`"The Fool"`, `"Ace of Wands"`).
  Returns both the upright and reversed meaning as reference.
- `tarot_spread(spread, positions?, question?, reversals?, seed?, session_id?)`
  — deals a named layout: `three_card`, `situation_obstacle_advice`,
  `celtic_cross` (10 positions), `horseshoe` (7 positions), `yes_no` (1
  position), or `custom` (caller supplies `positions[]`, max 20). Each
  position gets its own card, orientation and meaning. `question` is echoed
  back verbatim — this tool never interprets it; the calling agent does.
- `tarot_shuffle(session_id?, seed?)` — opens a new 78-card session, or
  reshuffles an existing one if `session_id` is given.

Meanings are traditional; interpretation is the calling agent's job, not this
pack's — every tool description says so.

## Sessions are hosted-only

`session_id` (on the drawing tools and `tarot_spread`) and `tarot_shuffle`
need the gateway's shared KV to track which cards have already been drawn. A
standalone/npm build of this pack has no KV binding, so those calls return
`{ session_supported: false, hint }` instead of throwing — single-call seeded
draws work identically either way, since they need no session.

A session draws **without replacement** across calls (it never repeats a card
until reshuffled), expires 24h after it's opened or last reshuffled, and its
card order is reproducible from the seed `tarot_shuffle` returns.

## Auth

Keyless. No upstream, no API key, no rate-limited third party — the deck is
inline and the randomness is local.

## Data sources

This pack has no live data source. The deck's structure (suit/rank layout,
the Major Arcana's traditional planet/zodiac correspondences, the suits'
elemental correspondences) follows centuries-old public-domain tarot
tradition. The Rider–Waite–Smith deck and A.E. Waite's 1910 "Pictorial Key to
the Tarot" (public domain) were consulted only as a reference for which
traditional images and themes this deck tracks — every card's keywords,
meanings and image description in `src/deck.ts` are original text written for
this pack, not a transcription of Waite's or any other published deck's
booklet.

## Reproducing a draw

Every drawing tool returns `meta.seed`. Passing that seed back as the `seed`
argument on an otherwise-identical call reproduces the exact same cards and
orientations. Omit `seed` for fresh randomness — the seed used is always
returned either way, so a draw is always citable even when it wasn't
requested as reproducible.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "tarot": {
      "url": "https://gateway.pipeworx.io/tarot/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/tarot/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1857+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/tarot_random_card \
  -H 'Content-Type: application/json' \
  -d '{}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/tarot_random_card`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-tarot` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/tarot/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "tarot": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-tarot"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Tarot data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
