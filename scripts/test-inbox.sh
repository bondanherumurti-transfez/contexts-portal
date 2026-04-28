#!/usr/bin/env bash
# Test the inbox endpoints against staging or local backend.
#
# Usage:
#   ./scripts/test-inbox.sh <cookie> [kb_id] [session_id]
#
# Getting the cookie:
#   1. Open the portal in your browser and log in
#   2. Open DevTools → Application → Cookies
#   3. Copy the value of 'contextus_portal_session'
#   4. Pass it as the first argument
#
# Examples:
#   ./scripts/test-inbox.sh "abc.def.ghi"
#   ./scripts/test-inbox.sh "abc.def.ghi" kb_finfloo_xxx
#   ./scripts/test-inbox.sh "abc.def.ghi" kb_finfloo_xxx sess_yyy

COOKIE="${1:-}"
KB_ID="${2:-}"
SESSION_ID="${3:-}"

BASE="${CONTEXTUS_API_BASE:-https://backend.backend-development.getcontextus.dev}"

if [ -z "$COOKIE" ]; then
  echo "Usage: $0 <contextus_portal_session cookie value> [kb_id] [session_id]"
  echo ""
  echo "Get the cookie from DevTools → Application → Cookies after logging in."
  exit 1
fi

CURL="curl -s -b contextus_portal_session=${COOKIE}"

echo "=== Backend: ${BASE} ==="
echo ""

# ── 1. /api/auth/me — verify auth works ─────────────────────────────────────
echo "--- GET /api/auth/me ---"
$CURL "${BASE}/api/auth/me" | python3 -m json.tool 2>/dev/null || echo "(no json response)"
echo ""

# ── 2. /api/portal/sites — get kb_id if not provided ────────────────────────
echo "--- GET /api/portal/sites ---"
SITES_JSON=$($CURL "${BASE}/api/portal/sites")
echo "$SITES_JSON" | python3 -m json.tool 2>/dev/null || echo "(no json response)"
echo ""

# Auto-detect kb_id from sites response if not provided
if [ -z "$KB_ID" ]; then
  KB_ID=$(echo "$SITES_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sites'][0]['kb_id'])" 2>/dev/null)
  if [ -n "$KB_ID" ]; then
    echo "(auto-detected kb_id: ${KB_ID})"
    echo ""
  fi
fi

if [ -z "$KB_ID" ]; then
  echo "Could not determine kb_id. Pass it as the second argument."
  exit 1
fi

# ── 3. /api/portal/sessions — inbox list ────────────────────────────────────
echo "--- GET /api/portal/sessions?kb_id=${KB_ID}&limit=50 ---"
SESSIONS_JSON=$($CURL "${BASE}/api/portal/sessions?kb_id=${KB_ID}&limit=50")
echo "$SESSIONS_JSON" | python3 -m json.tool 2>/dev/null || echo "(no json response)"
echo ""

# Auto-detect first session_id if not provided
if [ -z "$SESSION_ID" ]; then
  SESSION_ID=$(echo "$SESSIONS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['sessions'][0]['session_id'])" 2>/dev/null)
  if [ -n "$SESSION_ID" ]; then
    echo "(auto-detected session_id: ${SESSION_ID})"
    echo ""
  fi
fi

if [ -z "$SESSION_ID" ]; then
  echo "No sessions found — inbox will render wireframe 08 (empty state)."
  exit 0
fi

# ── 4. /api/portal/sessions/{id} — session detail ───────────────────────────
echo "--- GET /api/portal/sessions/${SESSION_ID} ---"
$CURL "${BASE}/api/portal/sessions/${SESSION_ID}" | python3 -m json.tool 2>/dev/null || echo "(no json response)"
echo ""
