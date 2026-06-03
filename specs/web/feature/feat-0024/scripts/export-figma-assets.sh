#!/usr/bin/env bash
# Export feat-0024 profile screenshots via pacepard-ui-agent (Figma Desktop + relay).
# Prerequisite: join_channel (see assets/README.md), Figma file open.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets"
mkdir -p "$OUT"
declare -A NODES=(
  [profile-read-minimal-hero]="11578:98647"
  [profile-read-with-cover]="11745:106250"
  [edit-profile-modal]="11732:105889"
)
echo "Export these nodes to $OUT (pacepard export_node_as_image, PNG scale=2):"
for name in "${!NODES[@]}"; do
  echo "  ${NODES[$name]} -> $OUT/${name}.png"
done
