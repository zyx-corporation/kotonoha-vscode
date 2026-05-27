#!/usr/bin/env bash
# Local M3 DB bootstrap: migrate + M6 RBAC for legacy default principal.
# Usage:
#   export DATABASE_URL='postgres://USER:PASS@localhost:5432/kotonoha_test'
#   ./scripts/m3_local_db_bootstrap.sh [kotonoha-binary]
set -euo pipefail

KO="${1:-${KOTONOHA_BIN:-kotonoha}}"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "error: set DATABASE_URL first" >&2
  exit 1
fi

echo "== migrate =="
"$KO" db migrate

echo "== RBAC: agent_runner (delta / attach) =="
if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
    UPDATE project_members
    SET role = 'agent_runner'
    WHERE project_id = '00000000-0000-4000-8000-000000000002'::uuid
      AND principal_id = '00000000-0000-4000-8000-000000000001'::uuid;
  "
else
  echo "note: psql not on PATH; run the UPDATE in docs/m3_acceptance_ja.md manually"
fi

echo "== done =="
echo "M6 RBAC (one role per principal — switch between steps):"
echo "  agent_runner → Register ΔM, rde attach"
echo "  reviewer     → Approve / Hold / Reject"
echo ""
echo "  docker exec kotonoha-pg psql \"\$DATABASE_URL\" -c \\"
echo "    \"UPDATE project_members SET role = 'reviewer' WHERE principal_id = '00000000-0000-4000-8000-000000000001'::uuid;\""
echo ""
echo "Then: ./scripts/m3_acceptance_cli_preflight.sh \"$KO\""
