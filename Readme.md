# Medianova CAPTCHA Client

> Privacy‑first CAPTCHA widget built with **Svelte 5** + **Vite** and demo pages in **Vue 3**.

This repository packages the **Altcha** CAPTCHA widget and provides a local developer setup together with sample integration pages for the Medianova platform.

---

## ⚠️ Prerequisite — start the CAPTCHA server

The front‑end **will not function** unless a backend serving `/captcha/{version}/challenge` and verifying solutions is running.

1. Clone and follow the quick‑start guide in  
  **<https://github.com/isaturk66/medianova_ngx_http_captcha_module>**  
  (this spins up an NGINX instance with the CAPTCHA module listening on **port 80**).
  
2. Confirm you can reach, for example,  
  <http://localhost/captcha/1/challenge>.
  

---

## 🔧 Configure `.env.development`

Edit **only** the development file — **never touch `.env.production`** (that file is maintained by infra team).

```dotenv
VITE_ALTCHA_ENTRY_POINT=/dist/bundles/altcha.i18n.js // No need to change this
VITE_CHALLENGE_URL=http://localhost:9191/http://localhost/captcha/{version}/challenge //Change only if your nginx is not on localhost
VITE_VERIFY_URL=http://localhost:9191/http://localhost/captcha/{version}/challenge // Same as above
```

- `http://localhost/captcha/{version}/…` points to the NGINX CAPTCHA server you started above.
- The `http://localhost:9191/` prefix is the **CORS‑Anywhere** proxy that `npm run dev` launches automatically.  
  Remove it only if you disable the proxy.

---

## 🚀 Quick Start

```bash
# 1 – front‑end dev environment
nvm use          # Node 23.x as pinned in .nvmrc
npm install      # or pnpm / yarn
npm run dev      # widget builder + pages + CORS proxy
```

Open the demo pages in your browser, e.g.

- **Non‑interactive** mode <http://localhost:5173/src/pages/1/1.html>
- **Semi‑interactive** mode <http://localhost:5173/src/pages/2/2.html>

They should talk to the NGINX CAPTCHA server through the proxy without CORS errors.

---

## 📜 NPM Scripts

| Script | Description |
| --- | --- |
| **`npm run dev`** | Starts ① widget bundler, ② pages dev‑server, ③ CORS proxy (`:9191`) concurrently |
| **`npm run build`** | Cleans `dist/` and produces production builds for widget **and** demo pages |
| `npm run build:widget` | Build widget only (no i18n bundle) |
| `npm run build:i18n` | Build widget **+** language packs (`altcha.i18n.js`) |
| `npm run build:pages` | Build static HTML demo pages |

---

## 🗂 Folder Layout

```
medianova_captcha_client/
│
├─ src/                 # Library + demo sources
│  ├─ Altcha.svelte     # The widget
│  ├─ pages/            # Vue 3 demo pages (1/, 2/)
│  ├─ worker.ts         # Inline Web Worker (PoW brute‑force)
│  └─ i18n/             # Language packs
│
├─ dist/                # Build artefacts (git‑ignored)
├─ .env.*               # Environment presets
├─ vite.*.config.ts     # Separate configs (widget, i18n bundle, pages)
└─ package.json
```

---

## ⚙️ How It Works

1. **Widget build** (`vite.config.ts`) compiles `src/entry.ts` into ES modules under `dist/bundles/`.
2. `entry.ts` injects minified global CSS and registers the `<altcha-widget>` custom element.
3. Demo pages are Vue SFCs. `vite.pages.config.ts` copies their HTML to repo root at build‑time so asset paths resolve identically in production (`/captcha/...`).
4. `src/worker.ts` distributes the hash brute‑force across `navigator.hardwareConcurrency` threads.
5. The widget emits `statechange`, `verified`, etc., letting any framework react to verification status.

---

## 📄 Licence

© 2025 Medianova Inc. & Altcha contributors.