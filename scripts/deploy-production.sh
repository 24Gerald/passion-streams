#!/usr/bin/env bash
# Passion Streams — production deploy helper
# Prerequisites: gh auth login, render login, MongoDB Atlas URI
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERCEL_TEAM="danijerban24-9506s-projects"
VERCEL_PROJECT="passion-streams"
FRONTEND_URL="https://passion-streams-orpin.vercel.app"
RENDER_SERVICE="passion-streams-api"

echo "==> 1. Push latest code to GitHub"
gh auth status
git push gerald main

echo ""
echo "==> 2. MongoDB Atlas"
if [ -z "${MONGODB_URI:-}" ]; then
  echo "Set MONGODB_URI before continuing."
  echo "Atlas: https://cloud.mongodb.com → Create M0 cluster → Database Access → Network Access (0.0.0.0/0)"
  echo "Connection string: mongodb+srv://USER:PASS@cluster.mongodb.net/passion_streams"
  read -r -p "Paste MONGODB_URI: " MONGODB_URI
fi

echo ""
echo "==> 3. Deploy backend on Render"
echo "Open https://dashboard.render.com/select-repo?type=blueprint"
echo "Connect repo: 24Gerald/passion-streams"
echo "When prompted for MONGODB_URI, paste your Atlas connection string."
echo ""
read -r -p "After Render deploy finishes, paste your API URL (e.g. https://passion-streams-api.onrender.com): " RENDER_API_URL

echo ""
echo "==> 4. Set Vercel env + redeploy frontend"
TOKEN=$(python3 -c "import json; print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")
PROJECT_ID="prj_gVfqMMJy8DxMjL7ynHJARVMh8TBs"
TEAM_ID="team_WIgyFbj2RH85THdQ8EuI2tlA"

curl -fsS -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"VITE_API_URL\",\"value\":\"${RENDER_API_URL}\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\",\"development\"]}"

cd backend
npx vercel@latest deploy --prod --token "$TOKEN" --yes

echo ""
echo "Done!"
echo "  Frontend: ${FRONTEND_URL}"
echo "  Backend:  ${RENDER_API_URL}"
echo "  Admin:    ${FRONTEND_URL}/admin/login (admin@passionstreams.com / passionstreamsADMIN)"
