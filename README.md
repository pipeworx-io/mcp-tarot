# mcp-tarot

MCP server for tarot card readings and search via [tarotapi.dev](https://tarotapi.dev/). Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `random_card` | Draw a single random tarot card with meanings |
| `draw_cards` | Draw multiple random tarot cards (1-78) |
| `search_cards` | Search tarot cards by keyword |
| `get_card` | Get a specific card by its short name identifier |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "tarot_draw_cards",
      "arguments": { "count": 3 }
    },
    "id": 1
  }'
```

## License

MIT
