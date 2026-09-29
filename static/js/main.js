const state = { company: "samsung" };

const CATS = {
  phones:  { icon: "smartphone", chip: "bg-sky-400/15 text-sky-300" },
  laptops: { icon: "laptop",     chip: "bg-violet-400/15 text-violet-300" },
  tablets: { icon: "tablet",     chip: "bg-emerald-400/15 text-emerald-300" },
};

const SUGGESTIONS = [
  { q: "How has this company evolved across phones, laptops, and tablets?", mode: "llm" },
  { q: "What does the recent lineup say about their AI strategy?", mode: "llm" },
  { q: "Compare Samsung's and Apple's pricing across categories", mode: "compare" },
  { q: "Which company launched more devices in 2025?", mode: "compare" },
];

const MODE_LABELS = {
  reflect: "Hindsight reflect",
  llm: "LLM analyst",
  compare: "LLM · both companies",
};

const switchEl = document.getElementById("brand-switch");
const thumb = document.getElementById("thumb");
const form = document.getElementById("ask-form");
const input = document.getElementById("query");
const modeEl = document.getElementById("mode");
const answerEl = document.getElementById("answer");

function setBrand(company) {
  state.company = company;
  document.body.dataset.brand = company;
  thumb.classList.toggle("translate-x-full", company === "apple");
  document.querySelectorAll(".switch-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.company === company));
  answerEl.innerHTML = '<p class="text-zinc-500">Pick a question above, or type your own.</p>';
  loadTimeline(company);
}

document.querySelectorAll(".switch-btn").forEach(btn =>
  btn.addEventListener("click", () => setBrand(btn.dataset.company)));

async function loadTimeline(company) {
  const res = await fetch(`/events?company=${company}`);
  const events = await res.json();
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  document.getElementById("stat-events").textContent = events.length;
  document.getElementById("stat-cats").textContent = new Set(events.map(e => e.category)).size;
  document.getElementById("stat-since").textContent = events.length
    ? new Date(events[0].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "-";

  document.getElementById("timeline").innerHTML = events.map((e, i) => {
    const c = CATS[e.category] || { icon: "box", chip: "bg-zinc-400/15 text-zinc-300" };
    const date = new Date(e.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    return `
      <li class="event-card group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]" style="animation-delay:${i * 90}ms">
        <span class="absolute -left-[30px] top-6 h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--glow)] ring-4 ring-[#0b0c10]"></span>
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.chip}">
            <i data-lucide="${c.icon}" class="h-3.5 w-3.5"></i>${e.category}
          </span>
          <time class="font-mono text-xs text-zinc-500">${date}</time>
        </div>
        <p class="mt-3 text-[15px] leading-relaxed text-zinc-200">${e.headline}</p>
      </li>`;
  }).join("");
  lucide.createIcons();
}

async function ask(query) {
  answerEl.innerHTML = `
    <div class="space-y-3">
      <div class="shimmer h-4 w-3/4 rounded"></div>
      <div class="shimmer h-4 w-full rounded"></div>
      <div class="shimmer h-4 w-5/6 rounded"></div>
    </div>`;

  const mode = modeEl.value;
  const endpoint = mode === "reflect" ? "/ask" : "/ask_llm";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: state.company,
        query,
        compare: mode === "compare",
      }),
    });
    const data = await res.json();
    answerEl.innerHTML = `
      <div class="fade-in">
        <div class="mb-3 inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">${MODE_LABELS[mode]}</div>
        ${marked.parse(data.answer || "No answer returned.")}
      </div>`;
  } catch (err) {
    answerEl.innerHTML = '<p class="text-red-400">Something went wrong reaching the agent. Try again.</p>';
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) ask(q);
});

document.getElementById("chips").innerHTML = SUGGESTIONS.map((s, i) =>
  `<button type="button" data-i="${i}" class="chip rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-300 transition hover:border-[var(--accent)] hover:text-white">${s.q}</button>`
).join("");

document.querySelectorAll(".chip").forEach(chip =>
  chip.addEventListener("click", () => {
    const s = SUGGESTIONS[chip.dataset.i];
    input.value = s.q;
    modeEl.value = s.mode;
    form.requestSubmit();
  }));

lucide.createIcons();
loadTimeline(state.company);