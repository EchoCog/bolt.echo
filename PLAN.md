# Plan

Status: I put in a resilient SSR fallback so the web app never hard-crashes during render; dev is restarted on http://localhost:5174. Now proposing a robust offline-first desktop architecture that guarantees graceful degradation.

### Short answer
Your idea is solid. Build a local-first Electron shell that:
- hosts the entire UI locally (so connection loss doesn’t affect UX),
- centralizes integrations/settings/deep links,
- and orchestrates LLM backends with a strict fallback ladder: cloud → local GPU → local CPU tiny gguf → template/rule-based minimal answers.

### Recommended architecture
- Core shell
  - Electron main process + BrowserViews for each “app” (your current app can be a view).
  - Unified Settings window: API keys, model choices, network/energy policies.
  - Deep links/protocols: `app.setAsDefaultProtocolClient('boltecho')`; route URIs to the right view/route.
  - Auto-update + crash-safe “Safe Mode” that loads a minimal UI if any renderer fails.
- LLM Orchestrator (Node service in main process)
  - Health-checked providers with circuit breakers and timeouts.
  - Fallback order: 
    1) Cloud (Anthropic/OpenAI/etc.) 
    2) Local GPU (if available) 
    3) Local CPU tiny gguf (battery-friendly) 
    4) Minimal rule/template fallback (never returns nothing).
  - Provider selection driven by telemetry: network status, power/battery via `powerMonitor`, latency/error budgets.
- Local inference (CPU)
  - Bundle a portable llama.cpp server binary and spawn it on demand; connect via HTTP or stdio.
  - Ship 1–2 tiny gguf models quantized for CPU:
    - TinyLlama-1.1B-Chat Q4_K_M
    - Qwen2.5-1.5B-Instruct Q4_K_M
    - SmolLM2-1.7B-Instruct Q4_K_M
  - Autoswitch to tiny model when on-battery/low-power; allow user override.
- Data and caching
  - Local SQLite (via better-sqlite3) for chat history, prompts, vector-lite if needed.
  - Disk caches for recent context and embeddings to reduce network churn.
- UI resilience
  - Local static assets, no remote UI rendering.
  - Error boundaries per view; shell-wide watchdog that can restart a view without killing the app.
  - Service Worker optional (for web builds), but Electron packaging already keeps assets local.

### How this plugs into your current app
- Keep Remix app unchanged for cloud deployments; inside Electron, route “streamText” calls through a shell bridge:
  - If `window.shell?.llmStream` exists, use it; else call the existing `/api.chat`.
  - The shell’s LLM Orchestrator decides which provider to use (cloud/local).
- Graceful degradation policy:
  - If cloud key missing/invalid or network down → transparently fall back to local model.
  - If no GPU or on battery saver → prefer tiny CPU gguf.
  - If even local model fails → respond with a concise rule-based/template answer so the UI never stalls.

### Concrete stack choices
- Electron + electron-builder
- Settings: `electron-store` + `keytar` for secrets
- Updates: `electron-updater`
- Local LLM: bundled llama.cpp (Windows x64), spawned child process; models stored under app data.
- Optional alternative: Tauri (smaller footprint, Rust commands) if you want tighter security and are OK writing small Rust shims.

### Next steps I can do now
- Scaffold `apps/shell-electron` with:
  - Main process, preload bridge, Settings window, BrowserView for your app.
  - Deep link `boltecho://`.
  - LLM Orchestrator with pluggable providers (Cloudflare env → Anthropic; llama.cpp local; minimal fallback).
  - Basic policy: network + power-based auto-selection.
- Add a renderer-side bridge in your app to call the shell if present, else hit `/api.chat`.
- Bundle a tiny gguf and a llama.cpp binary for Windows.

Say “scaffold the electron shell” and I’ll create it with the pieces above.

- Added SSR fallback logic so the app never hard-crashes during render; restarted dev on `http://localhost:5174`.
- Proposed an Electron-based, offline-first shell with an LLM fallback ladder (cloud → local GPU → local CPU tiny gguf → minimal fallback), unified settings, and deep-link support.
- Ready to scaffold the Electron shell and wire your app to it now.

