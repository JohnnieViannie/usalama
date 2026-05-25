# Movara dashboard

React + Vite client for company operations (guards, incidents, registration links, corporate security surveys).

## API (same server as the guard app)

Guards complete **site security surveys in the Flutter app**; Django stores one record; this dashboard **lists** that data and lets clients **view, edit (JSON + status), delete, export PDF**, and save **review notes**. Surveys are not created on the web UI.

| Component | Local default |
|-----------|----------------|
| Django | `python manage.py runserver 0.0.0.0:8080` (in `server/`) |
| Flutter app | `http://localhost:8080/api/` — see `app/lib/shared/constants.dart` |
| Dashboard | `VITE_API_URL` in `dashboard/.env` |

Set `VITE_API_URL` in `dashboard/.env` to match your API (same host as the Flutter app). After editing, restart `npm run dev` or run `npm run build` again.

If the app and dashboard use different hosts or ports, submissions from the app will not appear here.

**Physical device:** use your PC’s LAN IP instead of `localhost` in both the app and `VITE_API_URL`.

## Develop

```bash
cd dashboard
npm install
npm run dev
```

When `VITE_API_URL` is unset, requests use `/api` and the dev server proxies to port **8080**. When set, `fetch` goes to that full URL (e.g. `https://server.movarasec.com/api`).
