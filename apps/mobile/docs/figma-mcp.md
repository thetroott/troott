# Figma MCP connection (Troott)

## Talk to Figma channel vs file URL

| What | Value |
|------|--------|
| **WebSocket channel** (plugin + `join_channel`) | Agreed value, e.g. `7t5m5zh5` or `mehslzoh` |
| **Figma file** (open in desktop) | [Troott](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott) — file key `9lFM6TncipSv0pNVGBWZwA` |

The channel name is whatever you type in the **Cursor Talk to Figma MCP** plugin; it does **not** have to match the file key. Cursor and the plugin must use the **same** channel (e.g. `7t5m5zh5`).

**Splash / welcome frame:** [node 4081-19306](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4081-19306) — implemented in `app/index.tsx`.

## Connect Cursor to Figma

1. **WebSocket server** must be running (TalkToFigma bridges Cursor and Figma):
   - From a clone of [cursor-talk-to-figma-mcp](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp): run `bun socket`, **or**
   - Follow the package README for your setup.

2. **Figma desktop:** install the [Cursor Talk to Figma MCP plugin](https://www.figma.com/community/plugin/1485687494525374295/cursor-talk-to-figma-mcp-plugin), open the **Troott** file above, run the plugin, and **join channel** with the same value you use in Cursor (e.g. `7t5m5zh5`).

3. **Cursor:** ensure MCP **TalkToFigma** is enabled (see [.cursor/mcp.json](../.cursor/mcp.json)). Run **join_channel** with the same channel string as the plugin (e.g. `7t5m5zh5`).

4. Use MCP tools (`get_node_info` with e.g. `4081:19306`, `read_my_design`, etc.) only **after** both sides are on the same channel.

## Project MCP config

[.cursor/mcp.json](.cursor/mcp.json) registers:

```json
"TalkToFigma": {
  "command": "bunx",
  "args": ["cursor-talk-to-figma-mcp@latest"]
}
```

Requires [Bun](https://bun.sh) installed for `bunx`.
