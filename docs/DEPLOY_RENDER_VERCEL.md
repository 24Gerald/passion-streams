# Deploy Passion Streams (MongoDB + Render + Vercel)

Production stack:
- **Frontend:** Vercel → `https://passion-streams-orpin.vercel.app`
- **Backend:** Render → `passion-streams-api`
- **Database:** MongoDB Atlas (free M0)

---

## Step 1 — Push code to GitHub

```bash
gh auth login
git push gerald main
```

Repo: `https://github.com/24Gerald/passion-streams`

---

## Step 2 — Create MongoDB Atlas (free)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → **Create** → **M0 FREE** cluster
2. **Database Access** → Add user (username + password, built-in role: readWriteAnyDatabase)
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)  
   *(Required for Render’s dynamic IPs)*
4. **Database** → **Connect** → **Drivers** → copy connection string:

```
mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/passion_streams?retryWrites=true&w=majority
```

Replace `USER`, `PASS`, and ensure database name is `passion_streams`.

---

## Step 3 — Deploy backend on Render

1. Log in: [Render Dashboard](https://dashboard.render.com)
2. **New** → **Blueprint** → connect GitHub repo `24Gerald/passion-streams`
3. Render reads `render.yaml` and creates `passion-streams-api`
4. When prompted for **MONGODB_URI**, paste your Atlas connection string
5. Wait for deploy → copy your service URL, e.g.  
   `https://passion-streams-api.onrender.com`

Verify:

```bash
curl https://passion-streams-api.onrender.com/health
# {"status":"ok",...}
```

Default accounts are auto-seeded on first boot (`SEED_IF_EMPTY=true`):

| Role  | Email                      | Password            |
|-------|----------------------------|---------------------|
| Admin | admin@passionstreams.com   | passionstreamsADMIN |
| User  | sarah@test.com             | password123         |

---

## Step 4 — Connect Vercel frontend to Render API

1. [Vercel Dashboard](https://vercel.com) → project **passion-streams**
2. **Settings** → **Environment Variables**
3. Add:

| Key            | Value                                      | Environments              |
|----------------|--------------------------------------------|---------------------------|
| `VITE_API_URL` | `https://passion-streams-api.onrender.com` | Production, Preview, Dev |

4. **Deployments** → latest production → **⋯** → **Redeploy**

Or via CLI:

```bash
npx vercel login
npx vercel env add VITE_API_URL production
# paste Render URL when prompted
cd backend && npx vercel --prod
```

*(Vercel root directory is `backend/` — it builds the frontend from `../frontend`.)*

---

## Step 5 — Test end-to-end

1. Open `https://passion-streams-orpin.vercel.app/login`
2. Sign in as `sarah@test.com` / `password123`
3. Create a community post → approve at `/admin/login`
4. Test Passion Connect discover + chat

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API calls fail / CORS | Ensure `FRONTEND_URL` on Render is `https://passion-streams-orpin.vercel.app` |
| MongoDB connection error | Check Atlas IP allowlist includes `0.0.0.0/0` and password is URL-encoded |
| Render cold start (~30s) | Free tier sleeps after inactivity; first request may be slow |
| Admin login fails | Use seeded admin credentials; check Render logs for seed message |

---

## Optional: one-shot script

After `gh auth login`, `render login`, and creating Atlas:

```bash
MONGODB_URI='mongodb+srv://...' ./scripts/deploy-production.sh
```
