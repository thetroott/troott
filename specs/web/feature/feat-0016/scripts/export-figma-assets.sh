#!/usr/bin/env bash
# Export feat-0016 tour screenshots via pacepard-ui-agent (Figma Desktop + relay).
# Usage: join channel 5mtmmnxl, then run export_node_as_image for each node below.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets"
mkdir -p "$OUT"
declare -A NODES=(
  [step-01-screen]="3809:486"
  [step-01-popover]="3815:958"
  [step-02-screen]="3815:17094"
  [step-02-popover]="3815:17355"
  [step-03-screen]="3815:17483"
  [step-04-screen]="3816:18146"
  [step-04-popover]="3816:18407"
  [step-05-screen]="3816:18796"
  [step-05-popover]="3816:18535"
)
echo "Export these nodes to $OUT (pacepard export_node_as_image, PNG scale=2):"
for name in "${!NODES[@]}"; do
  echo "  ${NODES[$name]} -> $OUT/${name}.png"
done
