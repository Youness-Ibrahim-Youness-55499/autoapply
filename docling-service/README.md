# docling-serve (local test harness)

This folder exists only to test [docling](https://github.com/docling-project/docling)
as a possible CV-parsing engine. It runs the official
[`docling-serve`](https://github.com/docling-project/docling-serve) REST API
locally — there's no custom Python code here, and nothing in this folder is
deployed anywhere. The React app's [`/app/docling-test`](../src/pages/DoclingTestPage.tsx)
page talks to it directly over `http://localhost:5001`.

## Setup (already done once on this machine)

```bash
python -m venv venv
venv\Scripts\python.exe -m pip install "docling-serve[ui]"
```

The first `pip install` pulls in `torch` and docling's ML dependencies —
expect a large download (multiple GB) and several minutes.

## Running it

```bash
cd docling-service
venv\Scripts\docling-serve.exe run --enable-ui
```

This starts the server at `http://127.0.0.1:5001`:

- REST API: `http://127.0.0.1:5001`
- Swagger docs: `http://127.0.0.1:5001/docs`
- Docling's own UI playground: `http://127.0.0.1:5001/ui`

CORS is wide open by default (`DOCLING_SERVE_CORS_ORIGINS=["*"]`), so the
Vite dev server on `localhost:5173` can call it directly with no extra
config.

**The first document you convert will be slow** (models download to
`~/.cache` on first use). After that, conversions are much faster.

## Using it from the app

1. Start `docling-serve` (above).
2. Start the app's dev server (`pnpm dev` from the repo root).
3. Sign in and go to `/app/docling-test`.
4. Upload a CV (PDF or DOCX) and click "Process with docling."

The page shows the raw Markdown and JSON docling produced, plus status and
timing, so you can judge whether its output is good enough to build a real
CV-parsing feature on.

## Cleaning up

This whole branch is disposable. To remove the local install:

```bash
rmdir /s docling-service\venv
```
