# Optional Mosaic sync backend

The static app still works by itself. To enable profile sync, this package includes a small Node.js backend with no third-party runtime dependencies. It syncs data for all profiles; each profile keeps its own lists, comments, followed creators, and language setting.

## Run on a local machine

Install Node.js 20 or later, open a terminal in the deployment folder, then run:

```sh
node backend/server.mjs
```

Open `http://localhost:8787`. The server hosts the app and the sync API on the same origin. Its default data directory is `.mosaic-data/`; set `MOSAIC_DATA_DIR` to a durable private volume before production use. Set `PORT` to change the listen port.

## Deploy for multiple devices

Put the Node server behind an HTTPS reverse proxy and mount a persistent, access-restricted data volume. Set `MOSAIC_ALLOWED_ORIGIN` to the exact Mosaic web origin only when the frontend and API use different origins. If the frontend is on another host, set the `mosaic-api` meta tag in `index.html` to the API base URL. The API sends CORS headers only for the configured origin.

Run the server's built-in unit checks with:

```sh
node --test backend/server.test.mjs
```

## Data and security boundary

- Sync stores profile lists, preferences, progress, likes, and playlists. It never receives media bytes.
- Sync stores all five profiles' settings and lists, plus profile-scoped Reels comments, followed creators, and language choice. Changes use version checks: an older device cannot silently overwrite a newer copy; review conflicts from Settings → Sync now.
- A 16-character sync code is a bearer credential: anyone who has it can read, replace, or delete that sync record. Share it only with devices you control.
- The code is hashed for the on-disk filename. Sync data is plain JSON on the server disk, so protect the volume and use HTTPS in transit.
- Requests have body and rate limits. The server does not provide user accounts, public community comments, moderation, backups, or multi-region replication.
- The version check prevents stale writes, but it does not merge simultaneous edits. The app asks which whole profile snapshot to keep when it detects a conflict.
- Static routes are allowlisted; the backend source and `.mosaic-data` directory are not served as public files.

Use a managed database and account-based access control before exposing shared data to a public user community.
