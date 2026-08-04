# 0002 - Cloudflare Workers + Durable Objects for Hosting, Cloudflare Workers AI for the LLM Layer

## Context

The project needed to be hosted publicly, for free, while supporting persistent WebSocket connections for both Lab playback and Live Pulse's real-time streaming - a "live" product where connection drops or cold-start delays directly undercut the value proposition. Separately, the LLM explanation layer needed a cost model that stayed at or near zero, ideally under $2-3/month even under real traffic from a public build-in-public series.

As of this project's start (2026), Fly.io and Heroku no longer offer meaningful free tiers. Render offers a genuine permanent free web service tier with WebSocket support, but free services sleep after roughly 15 minutes of inactivity and cold-start on the next request - a real conflict with a product whose Live Pulse mode is supposed to feel alive. Render was also ruled out on the basis of prior negative firsthand experience with the platform.

## Decision

Host the backend (Go engine + WebSocket server) on Cloudflare Workers + Durable Objects. Run the LLM explanation layer on Cloudflare Workers AI using an open model, with Claude Haiku via the Anthropic API held in reserve only as a fallback if free-model explanation quality proves insufficient. Host the frontend on Vercel or Cloudflare Pages.

## Consequences

- No sleep/cold-start penalty for the backend, unlike Render - directly serves the "live" product requirement.
- Backend hosting and LLM inference sit on the same platform, avoiding a second vendor and a second bill, and simplifying the operational story of the whole project.
- Cloudflare Workers AI's free tier (10,000 Neurons/day, no credit card) is expected to comfortably cover dozens of agent explanations per day, keeping the LLM layer at genuinely zero cost under normal side-project traffic.
- Adopts an edge/Durable Objects programming model rather than a traditional container, which carries more initial setup friction than a simple containerized deploy would have.
- Leaves a known fallback path (Claude Haiku) undeployed until/unless free-model quality is proven insufficient, deferring that cost decision until it's backed by real evidence rather than assumption.

## Alternatives Considered

- **Render (free tier)** - genuine free WebSocket support, but the cold-start-on-idle behavior directly undermines the Live Pulse product goal, and there was already a negative prior experience with the platform specifically.
- **Fly.io / Heroku** - both ruled out outright; neither offers a meaningful free tier as of this project's start.
- **Claude Haiku via Anthropic API as the primary LLM (not just fallback)** - would likely stay within a small monthly budget at low volume, but isn't strictly free, and using it as the default rather than the fallback would add a second vendor/bill for no immediate benefit over the free, same-platform Workers AI option.
