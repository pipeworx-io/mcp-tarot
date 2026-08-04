# mcp-tarot

Tarot MCP — wraps tarotapi.dev (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `random_card` | Draw one random tarot card from the full 78-card deck. Returns card name, short ID, suit, type (major/minor arcana), upright meaning, reversed meaning, and description. |
| `draw_cards` | Draw a spread of 1–78 random tarot cards (pass count). Returns each card's name, short ID, suit, type, upright meaning, reversed meaning, and description. |
| `search_cards` | Search tarot cards by keyword — matches against card names and descriptions. |
| `get_card` | Get a specific tarot card by its short name identifier (e.g. "ar01" for The Magician, "ar00" for The Fool, "wap01" for Ace of Wands). |

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Tarot data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
