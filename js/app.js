/* ObjectionIQ — app.js */

const PROXY_KEY   = 'oiq_proxy';
const HISTORY_KEY = 'oiq_history';
const MAX_HISTORY = 5;

let history = [];

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  history = loadHistory();
  const proxy = localStorage.getItem(PROXY_KEY);
  if (proxy) showTool();
  else showSetup();
});

/* ---- SCREENS ---- */
function showSetup() {
  document.getElementById('setup-screen').style.display = 'flex';
  document.getElementById('tool-screen').style.display  = 'none';
}
function showTool() {
  document.getElementById('setup-screen').style.display = 'none';
  document.getElementById('tool-screen').style.display  = '';
  renderHistory();
}

/* ---- PROXY ---- */
function saveProxy() {
  const val = document.getElementById('proxy-input').value.trim();
  if (!val || !val.startsWith('http')) {
    alert('Please enter a valid URL starting with https://');
    return;
  }
  localStorage.setItem(PROXY_KEY, val);
  showTool();
}

/* ---- HISTORY ---- */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function saveHistory() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch(e) {}
}
function addToHistory(objection) {
  history = [objection, ...history.filter(h => h !== objection)].slice(0, MAX_HISTORY);
  saveHistory();
  renderHistory();
}
function renderHistory() {
  const list = document.getElementById('history-list');
  const section = document.getElementById('history-section');
  if (!history.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.innerHTML = history.map(h => `
    <div class="history-item" onclick="loadHistory_('${escAttr(h)}')" title="${escAttr(h)}">
      ↩ ${escHtml(h.length > 55 ? h.slice(0, 55) + '…' : h)}
    </div>
  `).join('');
}
function loadHistory_(text) {
  document.getElementById('objection-input').value = text;
  document.getElementById('objection-input').focus();
}

/* ---- GENERATE ---- */
async function handleGenerate() {
  const objection   = document.getElementById('objection-input').value.trim();
  const dealStage   = document.getElementById('deal-stage').value;
  const stakeholder = document.getElementById('stakeholder').value;

  if (!objection) {
    document.getElementById('objection-input').focus();
    return;
  }

  const proxy = localStorage.getItem(PROXY_KEY);
  if (!proxy) { showSetup(); return; }

  const btn = document.getElementById('generate-btn');
  const btnText = document.getElementById('btn-text');
  btn.disabled = true;
  btnText.textContent = 'Generating…';

  showLoading();

  try {
    const prompt = buildPrompt(objection, dealStage, stakeholder);
    const res = await fetch(proxy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const raw  = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    const clean = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(clean); }
    catch { throw new Error('Could not parse response. Try again.'); }

    addToHistory(objection);
    showResponses(parsed, objection, dealStage, stakeholder);

  } catch (err) {
    showError(err.message);
  }

  btn.disabled = false;
  btnText.textContent = 'Generate responses';
}

/* ---- PROMPT ---- */
function buildPrompt(objection, dealStage, stakeholder) {
  return `You are an expert Solutions Engineer and pre-sales coach with 10+ years of experience closing enterprise SaaS deals.

A sales rep just heard this objection during a ${dealStage} conversation with a ${stakeholder}:

"${objection}"

Generate exactly 3 response strategies. Return ONLY a valid JSON object with this exact structure — no markdown, no preamble:

{
  "direct": {
    "response": "The direct response text here (2-3 sentences, confident and clear)",
    "why": "One sentence on why this approach works"
  },
  "reframe": {
    "response": "The reframe response text here (2-3 sentences, shifts perspective)",
    "why": "One sentence on why this approach works"
  },
  "question": {
    "response": "The question-based response here (1-2 sentences, opens a deeper conversation)",
    "why": "One sentence on why this approach works"
  }
}

Rules:
- Sound human, not scripted — avoid corporate jargon
- Never be defensive or dismissive
- Each response must be meaningfully different in approach
- Tailor to the ${dealStage} stage and ${stakeholder} persona
- The question-based response must end with a genuine open question`;
}

/* ---- UI STATES ---- */
function showLoading() {
  document.getElementById('output-empty').style.display   = 'none';
  document.getElementById('output-content').style.display = '';
  document.getElementById('output-content').innerHTML = `
    <div class="loading-wrap">
      <div class="dots">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <p class="loading-text">Crafting your responses…</p>
    </div>`;
}

function showError(msg) {
  document.getElementById('output-content').innerHTML = `
    <div class="error-msg">Something went wrong: ${escHtml(msg)}<br>Check your proxy URL and try again.</div>`;
}

function showResponses(data, objection, stage, stakeholder) {
  const types = [
    { key: 'direct',   label: 'Direct',   cls: 'rc-direct',   delay: 0   },
    { key: 'reframe',  label: 'Reframe',  cls: 'rc-reframe',  delay: 0.1 },
    { key: 'question', label: 'Question', cls: 'rc-question',  delay: 0.2 },
  ];

  const cards = types.map(t => {
    const d = data[t.key];
    if (!d) return '';
    return `
      <div class="response-card" style="animation-delay:${t.delay}s">
        <div class="rc-header">
          <span class="rc-type ${t.cls}">${t.label}</span>
          <button class="rc-copy" id="copy-${t.key}" onclick="copyResponse('${t.key}', '${encodeURIComponent(d.response)}')">Copy</button>
        </div>
        <p class="rc-text">${escHtml(d.response)}</p>
        ${d.why ? `<p style="font-size:12px;color:var(--text3);margin-top:8px;font-style:italic">${escHtml(d.why)}</p>` : ''}
      </div>`;
  }).join('');

  document.getElementById('output-content').innerHTML = `
    ${cards}
    <div class="output-meta">
      Generated for: <strong style="color:var(--text2)">${escHtml(stage)}</strong> · 
      Stakeholder: <strong style="color:var(--text2)">${escHtml(stakeholder)}</strong>
    </div>`;
}

/* ---- COPY ---- */
function copyResponse(key, encoded) {
  const text = decodeURIComponent(encoded);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-' + key);
    if (!btn) return;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

/* ---- HELPERS ---- */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g,'&quot;');
}

/* Enter key to submit */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.metaKey) handleGenerate();
});
