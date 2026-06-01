#!/usr/bin/env bash
# Export feat-0017 Sermon Analytics screenshots via pacepard-ui-agent (Figma Desktop + relay).
# Usage: join channel 5mtmmnxl, then run export_node_as_image for each node below.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets"
mkdir -p "$OUT"
declare -A NODES=(
  [overview-empty]="9974:29757"
  [overview-populated]="10408:36417"
)
echo "Export these nodes to $OUT (pacepard export_node_as_image, PNG scale=2):"
for name in "${!NODES[@]}"; do
  echo "  ${NODES[$name]} -> $OUT/${name}.png"
done
