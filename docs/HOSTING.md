# Hosted AEGIS-X

- Public site: https://debayan-cyberx.github.io/AEGIS-X/
- Full app: https://aegis-x-q52d.onrender.com
- Render service: https://dashboard.render.com/web/srv-dbcdaemq1p3s73d2kffg

Both deploy from `design/aegis-x-reinvention`, the repository default branch.
GitHub Pages publishes the static frontend with the `/AEGIS-X` base path.
Its command-center route opens Render, where authentication and simulations run.
The public lab on Pages invites visitors to sign in on the hosted app.

Render builds the root multi-stage Dockerfile. Node exports the frontend during
the build; only Python and static assets remain in the running container.
`app.hosted` mounts the existing API at `/api` and serves the frontend at `/`.
WebSockets use `/api/ws`, with one API worker for process-local broadcasts.
Database migrations run before startup. Verify readiness at `/api/health`.
The allowed origin defaults to Render's external URL. For a custom domain,
set `CORS_ORIGINS` to the exact HTTPS origins (comma-separated).

## Account

The bootstrap username is `analyst`. A random password is stored only in the
Render service's `DEMO_PASSWORD` environment variable. Reveal it in Render's
Environment page to sign in. Do not commit it or put it in public documentation.
Changing this variable does not change a user already stored in the database.
The existing account-management command provisions additional accounts only.

## Free hosting limits

The free service can sleep while idle. SQLite is on Render's ephemeral filesystem:
data resets on redeploy or instance replacement. Use synthetic demo data only.
Persistent storage requires a suitable paid service with a disk, or an external
database configured through `DATABASE_URL`. Keep the API at a single worker
until shared rate limiting and WebSocket fanout are implemented.

GitHub Pages must have **Settings → Pages → Source → GitHub Actions** selected.
The Pages workflow runs on changes to the deployment branch. If the Render URL
changes, update `NEXT_PUBLIC_APP_URL` in `.github/workflows/pages.yml`.

## Local builds

The existing `npm run dev`, Next.js proxy, and Docker Compose setup still work.
For an export, set `STATIC_EXPORT=true` and run `npm run build` in `frontend`.
Set `NEXT_PUBLIC_SAME_ORIGIN_API=true` when serving that export with `app.hosted`.
For a Pages export also set `NEXT_PUBLIC_BASE_PATH=/AEGIS-X` and
`NEXT_PUBLIC_APP_URL` to the Render origin. The output is `frontend/out`.
