# feat-0024 — Profile Figma assets

Screenshots from Troott Figma file `9lFM6TncipSv0pNVGBWZwA` (pacepard-ui-agent, Figma Desktop open).

| File (target) | Figma node | Description |
| ------------- | ---------- | ----------- |
| `profile-read-minimal-hero.png` | [`11578:98647`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=11578-98647) | Full profile read — placeholder hero (no banner image) |
| `profile-read-with-cover.png` | [`11745:106250`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=11745-106250) | Profile read — populated cover/banner |
| `edit-profile-modal.png` | [`11732:105889`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=11732-105889) | Edit Profile dialog (477×774) |

**Spec authoring:** Node text and layout were verified with `get_node_info` + `export_node_as_image` (PNG scale 2) in the design session that produced [PROFILE_DATA_ACTIONS_SPEC.md](../PROFILE_DATA_ACTIONS_SPEC.md). Commit the PNG files above when re-exporting from Figma.

Re-export (after `join_channel`):

```text
export_node_as_image nodeId=11578:98647 format=PNG scale=2
export_node_as_image nodeId=11745:106250 format=PNG scale=2
export_node_as_image nodeId=11732:105889 format=PNG scale=2
```

Or run [`../scripts/export-figma-assets.sh`](../scripts/export-figma-assets.sh) for the node list.
