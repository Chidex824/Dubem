# Dubem backend (Django + DRF)

Built to Dubem PRD v1.2. The JSON field names match what the React app already uses.

## Run locally
```bash
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # optional, defaults work
python manage.py migrate                              # also seeds the 4 posting types
python manage.py createsuperuser                      # this is your admin account
python manage.py runserver                            # http://localhost:8000
python manage.py test                                 # 39 tests
```
With Docker + PostgreSQL: `docker compose up --build`.
Emails print in the terminal until you set `EMAIL_HOST` (use a transactional provider; set up SPF, DKIM, DMARC on the sending domain).

## Connect the React app
Copy `frontend-swap/jobs.js` over `src/api/jobs.js` and set `VITE_API_URL=http://localhost:8000`. Nothing else changes.

## API
| Method & path | Who | What |
|---|---|---|
| GET `/api/jobs/` `?q=&type=&mode=&country=&days=&page=` | anyone | approved, open listings (paginated) |
| GET `/api/jobs/<slug>/` | anyone | detail; closed stay reachable; pending only for owner/admin |
| POST `/api/jobs/` | verified org | create, goes to the moderation queue |
| PATCH `/api/jobs/<slug>/` · POST `.../close/` | owner (admin can edit) | edit (back to queue) / close |
| POST `/api/jobs/<slug>/report/` | anyone | report a listing |
| GET `/api/my/jobs/` · `/api/my/stats/` · `/api/orgs/me/` | org | own listings, own analytics, profile |
| GET `/api/saved/` · PUT/DELETE `/api/saved/<slug>/` | verified user | saved jobs |
| GET/POST `/api/alerts/` · PATCH/DELETE `/api/alerts/<id>/` | verified user | saved-search alerts |
| GET `/api/alerts/unsubscribe/<token>/` | anyone | one-click unsubscribe |
| POST `/api/events/` `{slug,type:view\|apply_click,source}` | anyone | analytics |
| POST `/api/auth/signup/` `login/` `logout/` `resend/` `password-reset/` `password-reset/confirm/` · GET/PATCH/DELETE `/api/auth/me/` | | accounts |
| GET `/api/auth/verify/?token=` | email link | verifies, redirects to `/signup?status=verified\|expired` |
| GET `/api/admin/queue/` · POST `/api/admin/jobs/<slug>/approve\|reject/` | admin | moderation (reject needs `reason`) |
| GET `/api/admin/analytics/?days=` · `/api/admin/orgs/` · POST `/api/admin/orgs/<slug>/verify\|unverify\|suspend\|unsuspend/` | admin | analytics, org verification |

Auth header: `Authorization: Token <token>` (returned by signup/login).

## Scheduled jobs (cron)
```
*/10 * * * *  python manage.py send_alerts --frequency instant
0 7 * * *     python manage.py send_alerts --frequency daily
0 3 * * *     python manage.py purge_unverified
```
`python manage.py whatsapp_digest --days 1` prints a copy-paste digest (manual fallback).
Set `WHATSAPP_WEBHOOK_URL` to auto-post on approval; failures are logged in `DistributionLog` and never block a listing.

## Not built yet (PRD phase 2b/3)
Telegram post, CV upload and in-app Apply, per-org distribution settings, report review screen (reports are in Django admin), logo upload.
