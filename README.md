# AWS Route 53 Clone

A production-quality clone of the **AWS Route 53 DNS Management Console**, built as a hiring assignment to demonstrate full-stack engineering skills.

> **Note:** This is a UI/workflow clone only. It does **not** implement real DNS resolution. All DNS records are stored in SQLite for demonstration purposes.

---

## Features

- **Auth**: Mock login with session persistence via httpOnly JWT cookies
- **Hosted Zones**: Full CRUD — create, view, search, edit, delete with cascade
- **DNS Records**: Full CRUD for 9 record types (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA)
- **Search**: Backend-powered search for both zones and records
- **Filtering**: Filter DNS records by type (tab-based UI)
- **Pagination**: Server-side pagination with metadata
- **Persistence**: All data stored in SQLite, survives restarts
- **Route53 UI**: AWS-inspired sidebar, tables, modals, toast notifications
- **Coming Soon** placeholders: Traffic Policies, Health Checks, Resolver, Profiles
- **Validation**: Full Pydantic + frontend validation on all inputs

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + TypeScript |
| Backend | FastAPI (Python) |
| Database | SQLite (via SQLAlchemy ORM) |
| Auth | JWT in httpOnly cookies |
| HTTP Client | Axios |
| Styling | Vanilla CSS (AWS-inspired design system) |

---

## Architecture

```
Browser (Next.js :3000)
    │
    │  /api/* rewritten by Next.js proxy
    ↓
FastAPI (:8000)
    │
    ↓
SQLite (route53.db)
```

The Next.js dev server proxies all `/api/*` requests to FastAPI at `localhost:8000`. This means cookies work correctly on the same origin, avoiding cross-origin issues.

---

## Project Structure

```
route53-clone/
├── frontend/                    # Next.js TypeScript app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout (providers)
│   │   │   ├── globals.css      # AWS-inspired design system
│   │   │   ├── login/           # Login page
│   │   │   └── (dashboard)/     # Protected routes
│   │   │       ├── layout.tsx   # Auth guard + sidebar/header
│   │   │       ├── page.tsx     # Dashboard
│   │   │       ├── hosted-zones/page.tsx
│   │   │       ├── hosted-zones/[id]/page.tsx
│   │   │       ├── traffic-policies/  # Coming soon
│   │   │       ├── health-checks/     # Coming soon
│   │   │       ├── resolver/          # Coming soon
│   │   │       └── profiles/          # Coming soon
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header
│   │   │   ├── ui/              # Toast, Pagination, ConfirmDelete, ComingSoon
│   │   │   ├── hosted-zones/    # HostedZoneForm
│   │   │   └── records/         # RecordForm
│   │   ├── services/            # API service layer (auth, hostedZones, records)
│   │   ├── lib/                 # api.ts (Axios), auth-context.tsx
│   │   └── types/               # TypeScript interfaces
│   ├── next.config.ts           # Proxy rewrites
│   └── package.json
│
├── backend/                     # FastAPI Python app
│   ├── app/
│   │   ├── main.py              # App entry, CORS, routers, seed
│   │   ├── database.py          # SQLAlchemy SQLite connection
│   │   ├── models/              # ORM: User, HostedZone, DnsRecord
│   │   ├── schemas/             # Pydantic: auth, hosted_zone, dns_record
│   │   ├── routers/             # auth, hosted_zones, records, deps
│   │   └── services/            # auth, hosted_zones, records
│   ├── requirements.txt
│   └── route53.db               # SQLite database (auto-created)
│
├── .gitignore
└── README.md
```

---

## Database Schema

```sql
-- users
CREATE TABLE users (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- hosted_zones
CREATE TABLE hosted_zones (
    id           INTEGER PRIMARY KEY,
    name         TEXT NOT NULL,
    description  TEXT,
    zone_type    TEXT NOT NULL DEFAULT 'public',
    private_zone BOOLEAN DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- dns_records (CASCADE deletes when zone deleted)
CREATE TABLE dns_records (
    id             INTEGER PRIMARY KEY,
    hosted_zone_id INTEGER REFERENCES hosted_zones(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL,  -- A|AAAA|CNAME|TXT|MX|NS|PTR|SRV|CAA
    ttl            INTEGER NOT NULL DEFAULT 300,
    value          TEXT NOT NULL,
    routing_policy TEXT NOT NULL DEFAULT 'simple',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Documentation

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, sets httpOnly cookie |
| POST | `/api/auth/logout` | Clears session cookie |
| GET | `/api/auth/me` | Returns current user |

### Hosted Zones
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hosted-zones` | List (search, page, page_size) |
| POST | `/api/hosted-zones` | Create |
| GET | `/api/hosted-zones/{id}` | Get by ID |
| PUT | `/api/hosted-zones/{id}` | Update |
| DELETE | `/api/hosted-zones/{id}` | Delete (cascades records) |

### DNS Records
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hosted-zones/{id}/records` | List (search, type, page, page_size) |
| POST | `/api/hosted-zones/{id}/records` | Create record in zone |
| PUT | `/api/records/{id}` | Update record |
| DELETE | `/api/records/{id}` | Delete record |

### Pagination Response Format
```json
{
  "items": [...],
  "page": 1,
  "page_size": 10,
  "total": 25
}
```

---

## Authentication

Authentication is **intentionally mocked** (per assignment requirements). It uses:
- **bcrypt** password hashing
- **JWT** tokens (HS256, 24h expiry)
- **httpOnly cookies** for session storage (not localStorage)

The cookie is set on `/api/auth/login` and cleared on logout. Session survives browser refresh by design.

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ / npm

### Backend

```bash
cd route53-clone/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend will:
- Auto-create SQLite tables on first run
- Seed a demo user and 3 sample hosted zones with DNS records
- Print: `Login: admin@route53.local / admin123`

### Frontend

```bash
cd route53-clone/frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `route53-clone-secret-key-...` | JWT signing secret |

Set in backend: `SECRET_KEY=your-secret python -m uvicorn ...`

> Never commit `.env` files. The `.gitignore` excludes them.

---

## Running Locally

1. Start backend: `python -m uvicorn app.main:app --port 8000`
2. Start frontend: `npm run dev`
3. Open `http://localhost:3000`
4. Login: `admin@route53.local` / `admin123`

---

## Testing

### API Tests (via PowerShell or curl)
```powershell
# Login
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -Body '{"email":"admin@route53.local","password":"admin123"}' `
  -ContentType "application/json" -SessionVariable ws -UseBasicParsing

# List zones
Invoke-WebRequest -Uri "http://localhost:3000/api/hosted-zones" -WebSession $ws -UseBasicParsing

# Interactive API docs
# Open: http://localhost:8000/docs
```

### Interactive Docs
FastAPI auto-generates Swagger UI at: `http://localhost:8000/docs`

### Manual E2E Checklist
- [ ] Login → Dashboard loads
- [ ] Create hosted zone → appears in table
- [ ] Refresh browser → zone still there
- [ ] Open zone → create A record + CNAME
- [ ] Search records → works
- [ ] Filter by type A → only A records shown
- [ ] Edit A record → value updated
- [ ] Refresh → edit persisted
- [ ] Delete CNAME → removed from table
- [ ] Delete zone → confirmation dialog → cascade deletes records
- [ ] Logout → redirected to login

---

## Known Limitations

1. **No real DNS resolution** — records are stored in SQLite only
2. **Single user** — no multi-user/RBAC support (mock auth)
3. **No AWS IAM** — simplified authentication
4. **No Traffic Policies / Health Checks / Resolver** — Coming Soon placeholders
5. **No BIND export/import** — bonus feature deferred
6. **No dark mode** — bonus feature deferred

---

## Deployment

The app is designed to be deployed with:
- **Frontend → [Vercel](https://vercel.com)** (Next.js native)
- **Backend → [Render](https://render.com)** (FastAPI + SQLite)

### Environment Variables

| Location | Variable | Value |
|---|---|---|
| Render (backend) | `SECRET_KEY` | Any strong random string |
| Render (backend) | `FRONTEND_URL` | `https://your-app.vercel.app` |
| Render (backend) | `HTTPS` | `true` |
| Vercel (frontend) | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/route53-clone.git
git push -u origin main
```

> `.env`, `.env.local`, and `*.db` are already excluded by `.gitignore`.

### Step 2 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. **Build command**: `pip install -r requirements.txt`
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `SECRET_KEY` = (click "Generate" for a random value)
   - `HTTPS` = `true`
   - `FRONTEND_URL` = *(fill in after Vercel deploy)*
7. Deploy → note your Render URL e.g. `https://route53-clone-api.onrender.com`

### Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set **Root Directory**: `frontend`
3. Framework: **Next.js** (auto-detected)
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://route53-clone-api.onrender.com`
5. Deploy → note your Vercel URL e.g. `https://route53-clone.vercel.app`

### Step 4 — Update Backend CORS

Go back to Render → Environment → update `FRONTEND_URL` to your exact Vercel URL → **Manual Deploy**.

### Step 5 — Verify

Open `https://route53-clone.vercel.app` and log in:
- Email: `admin@route53.local`
- Password: `admin123`

> **SQLite note:** Render free tier has an ephemeral filesystem. The database is
> automatically re-seeded with demo data on every restart, so the app will always
> be functional. User-created data may not survive a Render sleep/restart cycle.

---

## Screenshots

The application includes:
- AWS Route53-inspired dark navy sidebar
- Professional data tables with search and filters
- Modal dialogs for create/edit/delete
- Toast notifications for success/error feedback
- Loading and empty states for all views
