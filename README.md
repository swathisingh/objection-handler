# ObjectionIQ ⚡

> Turn client objections into opportunities — instantly.

Type any objection you hear in a sales conversation. Get 3 response strategies back — direct, reframe, and question-based — tailored to the deal stage and stakeholder.

**Live demo →** https://YOUR_USERNAME.github.io/objection-iq

---

## Part of #MidWeekDump · Experiment 02

Built as part of my public AI learning series. I'm a Solutions Engineer in adtech/SaaS and objection handling is one of the hardest, most repetitive parts of the role. This is my attempt to use Claude to sharpen that skill faster.

---

## Features

- 3 response strategies per objection — Direct, Reframe, Question-based
- Context-aware — adapts to deal stage and stakeholder type
- One-click copy for each response
- Recent objections history (browser only)
- Zero backend — runs entirely in the browser + Cloudflare Worker proxy

---

## Stack

- Plain HTML / CSS / JS — no frameworks, no build step
- Claude API (claude-sonnet via Cloudflare Worker proxy)
- Hosted on GitHub Pages

---

## Setup

### 1. Fork & enable GitHub Pages
1. Fork this repo
2. Go to **Settings → Pages → Source: main branch / root**
3. Live at `https://YOUR_USERNAME.github.io/objection-iq`

### 2. Deploy Cloudflare Worker
1. Free account at [workers.cloudflare.com](https://workers.cloudflare.com)
2. New Worker → paste `worker.js`
3. **Settings → Variables → Add secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)
4. Deploy → copy the `*.workers.dev` URL

### 3. Use it
1. Open your GitHub Pages URL
2. Paste your Cloudflare Worker URL when prompted
3. Type any objection, set the context, hit generate

---

## Privacy

Posts you enter are sent to Claude (Anthropic) to generate responses. Nothing is stored on any server — history lives only in your browser's localStorage.

---

## License

MIT — fork it, adapt it, make it yours.

---

*Built by [@YourName](https://linkedin.com/in/YOUR_PROFILE) · [#MidWeekDump](https://linkedin.com)*
