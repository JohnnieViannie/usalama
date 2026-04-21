
# Movara API (Django)

REST API under `/api/` for the dashboard and Flutter app. Authentication: JWT (`Authorization: Bearer <access>`), issued by `POST /api/login/` with email/password or phone/PIN.

## Setup

```bash
cd server
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000
```

Demo users from `seed_demo`: password `demo1234`, PIN `1234`. Example accounts: `client@example.com` (client dashboard), `guard@example.com` (guard mobile).

## Registration + linking endpoints

- `POST /api/company-signup/` open security company signup for dashboard accounts
- `POST /api/guard-register/` open guard self-registration from mobile app
- `GET /api/guard-registration-status/?email=...` or `?phone=...` lookup guard registration
- `POST /api/guard-link/` client company links a registered guard by email/phone
- `POST /api/submit-location-pings/` guard sends GPS route points
- `GET /api/location-pings/` client/admin reads route pings
- `GET /api/patrol-evidence/` client/admin gets combined patrol logs + location pings

`POST /api/scan-checkpoint/` now also stores GPS evidence when `latitude`/`longitude` are provided.

### Core business flow

1. Company signs up on dashboard (`/login` -> Sign up tab)
2. Guard signs up in mobile app
3. Company links guard from dashboard by guard email or phone
4. Linked guard data appears in dashboard monitoring endpoints

## Database settings

Configured in [`movara_api/settings.py`](movara_api/settings.py) under **`DATABASES`**:

- **Default (local):** SQLite file **`server/db.sqlite3`** (`NAME` is `BASE_DIR / "db.sqlite3"`).
- **Production:** set environment variable **`DATABASE_URL`** (for example PostgreSQL). See [`.env.example`](.env.example). When `DATABASE_URL` is present, Django uses **`dj-database-url`** to build the connection; optional **`DATABASE_SSL=true`** for managed databases that require SSL.

## Production (not `runserver`)

The message *“development server… do not use it in production”* is expected when you run **`python manage.py runserver`**. Production should use a WSGI server, for example **Gunicorn** (already in `requirements.txt`):

```bash
pip install -r requirements.txt
set DJANGO_DEBUG=false
set DJANGO_SECRET_KEY=your-very-long-random-secret-key-at-least-40-chars
set DJANGO_ALLOWED_HOSTS=your.api.host,localhost
set DATABASE_URL=postgres://user:pass@host:5432/dbname
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn movara_api.wsgi:application --bind 0.0.0.0:8000
```

Put the API behind **nginx** or **Caddy** for HTTPS, set **`DJANGO_CORS_ORIGINS`** to your dashboard origin, and if the proxy terminates TLS set **`DJANGO_SECURE_PROXY_SSL=true`** (see comments in `settings.py`).

### Windows local production-like run

`gunicorn` does not run natively on Windows (`fcntl` dependency). Use `waitress` locally:

```bash
pip install waitress
python -m waitress --listen=0.0.0.0:8000 movara_api.wsgi:application
```

## Clients

- **React dashboard** (`dashboard/`): `npm run dev` — Vite proxies `/api` to `http://127.0.0.1:8000`. Log in as a **client** user only.
- **Flutter app** (`app/`): point at this host, for example:

  `--dart-define=API_BASE_URL=http://127.0.0.1:8000/api/ --dart-define=USE_MOCK_API=false`

  Paths expect a trailing slash on each route (see Django `APPEND_SLASH`).
