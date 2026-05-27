#!/usr/bin/env bash
# M3 CLI preflight — same path as Extension UI (delta → attach → review → export m2).
# Usage:
#   ./scripts/m3_acceptance_cli_preflight.sh [PATH_TO_KOTONOHA_BINARY]
#
# Requires: DATABASE_URL, Git repo cwd
# See: docs/m3_acceptance.md · docs/m3_acceptance_ja.md
set -euo pipefail

KO="${1:-${KOTONOHA_BIN:-kotonoha}}"
if ! command -v "$KO" >/dev/null 2>&1 && [[ ! -f "$KO" ]]; then
  echo "error: kotonoha not found: $KO" >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "error: DATABASE_URL is required" >&2
  exit 1
fi

echo "== M3 CLI preflight (binary: $KO) =="

"$KO" db migrate

DEMO_FILE="${M3_DEMO_FILE:-docs/m3_demo_scratch.md}"
mkdir -p "$(dirname "$DEMO_FILE")"
echo "# M3 demo $(date -u +%Y-%m-%dT%H:%M:%SZ)" >"$DEMO_FILE"

OBS="${M3_DEMO_OBSERVATION:-/tmp/m3_observation.json}"
echo '{"intended_change":"M3 acceptance","preserved":["intent"]}' >"$OBS"

DELTA=$("$KO" delta create "$DEMO_FILE" --observation "$OBS")
echo "meaning_delta_id: $DELTA"

ASSESSMENT=$("$KO" rde emit | "$KO" rde attach --delta-id "$DELTA" --source-kind cli)
echo "rde_assessment_id: $ASSESSMENT"

DECISION=$("$KO" review approve --delta-id "$DELTA" --assessment-id "$ASSESSMENT" --decided-by "m3-acceptance")
echo "review_decision_id: $DECISION"

echo "export m2 (first 20 lines):"
"$KO" export --delta-id "$DELTA" --format m2 | head -n 20

echo "== M3 CLI preflight OK — continue with docs/m3_acceptance.md or docs/m3_acceptance_ja.md (F5 UI) =="
