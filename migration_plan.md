### 📋 INFRASTRUCTURE MIGRATION REPORT

#### Executive Summary

- **Current Setup**: Single-server deployment using Docker Compose on a VPS. An overarching Nginx container serves the static React frontend and reverse proxies `/api` requests to a Node.js/Express backend. The backend connects to an external database via `MONGO_URI`.
- **Core Problem**: Running a complete Docker/Nginx stack on a free tier or constrained VPS results in resource starvation (CPU/RAM limits), leading to slow response times, container restarts, and general sluggishness. The frontend assets must be served from the single server rather than a low-latency global CDN.
- **New Architecture**: Split architecture. The frontend will be hosted statically on Cloudflare Pages, taking advantage of their global edge CDN. The backend will be hosted as a standalone service on Railway, which provides persistent, scalable container hosting without the overhead of Nginx and Docker management.
- **Scope of Changes**: Relocating frontend hosting, relocating backend hosting, restructuring environment variable injection, updating frontend API routing (removing relative Nginx proxies in favor of absolute URLs), reconfiguring CORS on the backend, and deprecating the production `docker-compose.yml`.
- **Estimated Complexity**: **MEDIUM**
- **Risk Level**: **LOW**. The backend is already mostly stateless and containerized, and the frontend is a standard Vite React build. Database migration is minimal to none assuming MongoDB is already hosted externally via Atlas.

---

#### 🏛️ Why This Migration Solves the Performance Problem

- **The Infrastructure Bottleneck**: The current single-server free tier setup forces one small VPS to juggle Nginx routing, SSL termination, static file delivery, and Node.js process execution simultaneously. This causes CPU context switching and memory exhaustion, resulting in the perceived sluggishness.
- **Cloudflare Pages Advantage**: Cloudflare Pages serves the React static bundle from a global CDN edge network. This means zero CPU/RAM consumption on your end for frontend delivery. Users download the site from a server closest to them physically, drastically reducing initial load latency. It includes instant cache invalidation, zero cold starts for static assets, free SSL, and HTTP/3 out of the box.
- **Railway Advantage**: Moving the backend to Railway offloads Docker orchestration, reverse proxying, and SSL termination to their managed infrastructure. Your Node.js process gets a dedicated container with its own guaranteed resources, eliminating the resource competition from Nginx and frontend delivery. Railway provides proper Node.js hosting with integrated metrics, logs, and straightforward environment variable management with zero cold starts on the paid tier (and extremely rapid boots on the free tier).
- **Scalability**: This split is the de facto standard for scalable production architectures. It securely decouples the client from the API layer. If the backend needs more power later, you scale up Railway without touching the frontend. If traffic spikes globally, Cloudflare absorbs the frontend load automatically.

---

#### Current Architecture Diagram (text)

```text
Current:
User → VPS/Server → Nginx Container → [Frontend Static Files]
                                  → [Node.js Backend :3003]
                                  → [External Database]

New:
User → Cloudflare Edge (200+ locations) → [Frontend Static Build]
User → Railway Container → [Node.js Backend] → [External Database]
```

---

### 2. 🔄 What Changes and What Stays the Same

| Component                    | Current Setup                   | New Setup                          | Changes Required                                                                       |
| :--------------------------- | :------------------------------ | :--------------------------------- | :------------------------------------------------------------------------------------- |
| **Frontend serving**         | Nginx / Docker container        | Cloudflare Pages CDN               | Remove Nginx config. Add CF Pages project linked to repo.                              |
| **Backend serving**          | Docker on VPS / single server   | Railway container                  | New Railway project, Railway will detect `package.json` and run `npm start`.           |
| **Frontend → Backend comms** | Nginx routing (`/api` proxying) | Direct HTTPS to Railway URL        | Remove `proxy` reliance for production. Ensure absolute API URLs using `VITE_API_URL`. |
| **Environment variables**    | Single `.env` / Docker env      | Separate per platform              | Restructure `.env` into local frontend/backend files and platform dashboards.          |
| **CORS**                     | Reads `FRONTEND_URL`            | Must allow Cloudflare Pages domain | Update CORS dynamically to allow local dev + production CF Pages origin.               |
| **Database**                 | External Database (via URI)     | Stays external (MongoDB Atlas)     | None, provided it evaluates to a remote Atlas cluster.                                 |
| **Docker / Nginx**           | Used for all production hosting | No longer needed for deployment    | Deprecate production Docker setup. Keep for local dev only if desired.                 |
| **SSL / HTTPS**              | Managed manually or via Nginx   | Automatic on both platforms        | Nothing to manage, provided automatically by CF/Railway.                               |

---

### 3. 🌐 Frontend — Cloudflare Pages Setup Plan

1. **Build Command**: `npm run build` (This runs `vite build`).
2. **Output Directory**: `dist`.
3. **Environment Variables Needed in CF Dashboard**:
   - `VITE_API_URL`: `https://<your-railway-app>.up.railway.app/api`
   - `VITE_GOOGLE_CLIENT_ID`: `<google_client_id>`
   - `VITE_STRIPE_PUBLIC_KEY`: `<stripe_public_key>`
4. **VITE_API_URL Change**: Instead of pointing to `http://localhost:3003/api` or a Docker service name, the frontend must exclusively point to the absolute URL of the live Railway backend securely over HTTPS.
5. **SPA Routing (`_redirects`)**: Since this is a React Router SPA, Cloudflare Pages requires a `_redirects` file in the `public` directory so direct links (like `/events/123` or `/profile`) do not return 404s upon a hard refresh.
   - You must create `frontend/public/_redirects` with the exact content: `/* /index.html 200`.
6. **Vite Proxy Configuration**: The Vite proxy in `vite.config.js` is strictly for the Vite local dev server (`npm run dev`). It does not affect the production build, so it does not need to be refactored. The production `axios` configuration simply relies on `import.meta.env.VITE_API_URL`.
7. **Deployment Trigger**: Automatic via GitHub integration upon push to the branch.

---

### 4. 🚂 Backend — Railway Setup Plan

1. **Detection & Build**: Railway will automatically detect the Node.js application from the `package.json` when the `backend/` directory is selected. Neither `railway.toml` nor `Dockerfile` is strictly required; Railway's native Nixpacks builder excels at Node environments right out of the box.
2. **Start Command**: `npm start` (mapped to `node server.js` in your `package.json`), which correctly initiates the Express instance.
3. **Environment Variables**:
   _Required in Railway Dashboard:_
   - `NODE_ENV`: `production`
   - `PORT`: `3003` (Though Railway dynamically overrides this, providing it is fine)
   - `MONGO_URI`: `<production MongoDB Atlas connection string>`
   - `JWT_SECRET`: `<secret>`
   - `FRONTEND_URL`: `https://<your-cloudflare-pages-url>.pages.dev`
   - `STRIPE_SECRET_KEY`: `<secret>`
   - `STRIPE_WEBHOOK_SECRET`: `<secret>`
   - `CLOUDINARY_CLOUD_NAME`: `<name>`
   - `CLOUDINARY_API_KEY`: `<key>`
   - `CLOUDINARY_API_SECRET`: `<secret>`
   - `GOOGLE_CLIENT_ID`: `<id>`
   - `EMAIL_USERNAME`: `<email>`
   - `EMAIL_PASSWORD`: `<password>`
4. **PORT Handling**: Your current backend handles `PORT` organically: `const port = process.env.PORT || 3000;`. Railway will organically inject its ephemeral `PORT`, and Express will latch onto it without an issue. No codebase changes needed.
5. **Database Connection**: Although your `docker-compose.yml` injects the `MONGO_URI`, it has no overarching database container. Consequently, you are already utilizing an external or natively-installed Mongo cluster (highly likely MongoDB Atlas). Your backend setup remains wholly identical on Railway.
6. **Health Check Endpoint**: Railway pinging needs an initial `200` to verify a healthy container state. Your backend _already has_ an identical `/health` endpoint that gauges the connection to Mongo.

---

### 5. 🔐 Environment Variable Restructure

**Frontend (`frontend/.env.development`)**: (Do not commit to git)

```env
VITE_API_URL=http://localhost:3003/api
VITE_GOOGLE_CLIENT_ID=<id>
VITE_STRIPE_PUBLIC_KEY=<key>
```

**Frontend (`frontend/.env.production`)**: (Do not commit. Safer to set these directly in Cloudflare Pages Dashboard Variable settings.)

```env
VITE_API_URL=https://<your-railway-app>.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=<id>
VITE_STRIPE_PUBLIC_KEY=<key>
```

**Backend (`backend/.env`)**: (For local dev only. Do not commit. Set in Railway Dashboard for production.)

```env
PORT=3003
MONGO_URI=mongodb+srv://<cluster-endpoint>
JWT_SECRET=supersecretdev
FRONTEND_URL=http://localhost:5173
```

_Guiding Principle: Local `.env` files are natively for local development. Production secrets are entered exclusively via platforms' GUI dashboards._

---

### 6. 🔓 CORS Reconfiguration Plan

Currently, CORS in `server.js` dictates dynamic fallbacks strictly checking a single `.env` assignment constraint:

```javascript
// Current iteration relying on string extraction:
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

To robustly support dynamic origins safely (e.g. hitting external dev API servers via an active local frontend), we update this seamlessly:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g., https://your-app.pages.dev
  "http://localhost:5173", // Always allow local dev loops
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Accept requests lacking origins (mobile apps) or matching the list.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
```

- We inherently leave `credentials: true` on because `express` sets `res.cookie` during auth flows (JWT typically or generic secure cookies), necessitating strictly symmetric cookie handshakes.

---

### 7. 🗄️ Database Considerations

- Your current environment does **not** map a MongoDB container explicitly inside `docker-compose.yml`, it dynamically injects an overarching `MONGO_URI`. This indicates the db is likely hosted securely externally (MongoDB Atlas).
- **Recommendation**: Since Atlas Free Tier (M0) is active, it organically integrates into this infrastructure migration without needing further changes.
- **Critical Caveat**: Since Railway outbound IP addresses exhibit dynamic routing footprints, please ensure your MongoDB Atlas Network Access rules actively implement `0.0.0.0/0` (Allow Access from Anywhere) targeting Railway IP dynamic ranges, otherwise the Railway container will fail initialization loop phases.

---

### 8. 🗑️ Removing What Is No Longer Needed

Once the migration is fully confirmed and scaling, the following assets are instantly archived or purged strictly reflecting Docker/Nginx simplification:

1. `frontend/nginx.conf` (Cloudflare Pages absorbs static asset HTTP3 delivery logic).
2. `frontend/Dockerfile` (Cloudflare natively extracts Git build logic directly without Docker dependency).
3. `backend/Dockerfile` (Optional; Railway Nixpacks handles Node flawlessly without it, but no harm in preserving).
4. `docker-compose.yml` (For production server deployment, this is actively eradicated. Can be renamed to `docker-compose.local.yml` precisely mapped for local architectural testing).
5. The static serving block inside `backend/server.js`:
   ```javascript
   // SERVE FRONTEND (For Single-Server Deployments like Render)
   if (process.env.NODE_ENV === "production") {
     // Explicitly delete this static express module; the backend should strictly deliver the JSON API.
   }
   ```

---

### 9. ✅ Prioritized Implementation Checklist

**PHASE 1 — PREPARE THE CODEBASE (before touching platforms):**

- [ ] In `backend/server.js`: Remove the obsolete "SERVE FRONTEND" blocks mapping static dist layouts.
- [ ] In `backend/server.js`: Update CORS middleware to accept simultaneous multiple origins.
- [ ] In `frontend/public/`: Create a `_redirects` manifest holding `/* /index.html 200` mapped strictly for SPA layouts.
- [ ] Establish `frontend/.env.development` mapping local configurations distinctively.
- [ ] Affirm `frontend/src/` `axios`/API definitions target an absolute `VITE_API_URL` dynamically.
- [ ] Push codebase iteration structurally upstream via `git commit`.

**PHASE 2 — DEPLOY THE BACKEND TO RAILWAY:**

- [ ] Initialize Railway dashboard mapping a New Project.
- [ ] Ingest the GitHub repository routing structurally exclusively targeting the `backend/` directory pathing.
- [ ] Align overarching backend environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) identically mirroring `.env`.
- [ ] Alter MongoDB Atlas Network constraints appending `0.0.0.0/0`.
- [ ] Push manual iteration deploying Railway. Verify `/health` successfully echoes an active `200` MongoDB ready context.
- [ ] Secure Railway explicit public environment URL mapping (`https://<app>.up.railway.app`).

**PHASE 3 — DEPLOY THE FRONTEND TO CLOUDFLARE PAGES:**

- [ ] Bind GitHub application workflows dynamically targeting Cloudflare Pages.
- [ ] Establish direct deployment directories mirroring `frontend/` leveraging `npm run build` and `dist` extraction contexts.
- [ ] Set `VITE_API_URL` matching the generated dynamic Railway domain seamlessly.
- [ ] Conduct primary push sequences and authenticate SPA URL routing mechanisms directly.

**PHASE 4 — VALIDATE AND CLEAN UP:**

- [ ] Traverse backwards inside Railway configuration appending the active Cloudflare Pages domain exactly to `FRONTEND_URL`.
- [ ] Render full End-to-End behavioral mapping authenticating user logic structurally (login + dashboard verification routing seamlessly against AWS/React structures).
- [ ] Execute codebase cleanup eliminating redundant Nginx and explicit `docker-compose` production architectures.
- [ ] Update README with exact, structured structural changes tracking identical implementations.

---

📌 **What This Unlocks Beyond Performance**

- Eliminates exhaustive Linux VPS tuning structures (Nginx, SSL handshakes, server iteration mapping).
- Frontend deploys are instant — pushing downstream automatically enables Cloudflare CI/CD integration.
- Backends automate inherently — Railway digests upstream merges organically.
- Direct localized scaling: Upgrading Railway RAM/CPU tiers mirrors precise 1-click solutions structurally untethered to frontend constraints entirely.
