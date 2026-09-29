# Timeline IQ

A competitive intelligence agent that remembers every move Samsung and Apple make across phones, laptops, and tablets — and reasons across that history instead of just listing it. Built for Hack with Hyderabad 3.0, using [Hindsight](https://hindsight.vectorize.io/) as the memory layer.

## Why this exists

Most competitive intelligence tools (Crayon, Klue, Kompyte, and similar) are alert feeds — they tell you *what* changed. Timeline IQ is built to explain *what it means*, by letting an LLM reason over a growing memory of real product launches, pricing moves, and feature announcements spanning 2020–2026, rather than just summarizing the latest headline in isolation.

## How it works

- Two memory banks in Hindsight, one per company (`samsung`, `apple`)
- Real, sourced events (see [`dataset.md`](./dataset.md)) are pushed in with `retain_batch`, each carrying a real timestamp and a device-category tag (`phones`, `laptops`, `tablets`)
- A Flask backend exposes:
  - `GET /events?company=<name>` — the raw timeline, for the UI
  - `POST /ask` — calls Hindsight's own `reflect()` to synthesize an answer directly from memory, for one company at a time
  - `POST /ask_llm` — calls Hindsight's `recall()` to retrieve raw matching memories, then passes them to an LLM (Groq, `openai/gpt-oss-120b`) for a custom analyst-style synthesis; supports a `compare` mode that recalls from **both** banks at once for head-to-head questions
- A single-page UI shows the timeline on one side and a chat-style ask panel on the other, with a mode selector (Hindsight reflect / LLM analyst / compare both) and the whole color scheme switching between a Samsung theme and an Apple theme depending on which company is selected

## How Hindsight memory is used

This is the core of the project, not a bolt-on feature, and it's used two different ways:

- **`retain_batch`** stores every event with its real date and category tag, so Hindsight's temporal reasoning reflects when things actually happened, not when we typed them in
- **`reflect()`** powers the default "Ask" mode — Hindsight's own reasoning layer synthesizes a narrative directly from memory for one company, with no prompting from us at all
- **`recall()`** powers the "LLM analyst" and "compare both" modes — we retrieve the raw matching memories from one or both banks and hand them to our own LLM call, so we can do things `reflect()` alone can't, like comparing Samsung and Apple side by side in a single answer
- Because every memory is timestamped and tagged by device category, both paths support broad synthesis ("how has Samsung evolved across phones, laptops, and tablets?") and narrow, category-specific questions without any extra logic on our end

## Project structure

```
.
├── app.py              # Flask app: routes for /, /events, /ask, /ask_llm
├── llm.py               # Groq-based synthesis over recalled memories
├── seed.py               # One-time script: pushes events.py into Hindsight
├── delete_banks.py        # Utility: wipes both banks (used when re-seeding)
├── events.py                # Real, sourced event data, 2020-2026 (see dataset.md)
├── requirements.txt
├── .env                        # HINDSIGHT_API_KEY, GROQ_API_KEY (not committed)
├── dataset.md                   # Full source list and caveats for every event
├── LICENSE
├── templates/
│   └── index.html                # Split-view UI
└── static/
    ├── css/style.css
    └── js/main.js
```

## Running it locally

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:
```
HINDSIGHT_API_KEY=your-hindsight-api-key
GROQ_API_KEY=your-groq-api-key
```

Seed the memory banks (run once, or again only after changing `events.py`):
```bash
python3 seed.py
```

Start the app:
```bash
python3 app.py
```

Visit `http://127.0.0.1:5000`.

## Tech stack

- **Backend:** Flask (Python)
- **Memory:** [Hindsight Cloud](https://ui.hindsight.vectorize.io) (Vectorize)
- **LLM synthesis:** Groq (`openai/gpt-oss-120b`)
- **Frontend:** HTML, Tailwind CSS (CDN), vanilla JavaScript, [Lucide icons](https://lucide.dev/), [marked.js](https://marked.js.org/) for rendering markdown answers

## Team

- _Add team member names here_

## License

MIT — see [`LICENSE`](./LICENSE).
