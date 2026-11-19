// Logs AI-agent fetches/referrals to Supabase (aggregates only, no IPs stored). Never alters or delays the response.
const RPC = "https://ysmejdqyteqmjbtljwnh.supabase.co/rest/v1/rpc/ns_agent_hit";
const KEY = "sb_publishable_UyBnWalImBRPccaDZ0i__A_V9RBSA-P"; // public by design
const BOTS = ["ChatGPT-User", "OAI-SearchBot", "GPTBot", "PerplexityBot", "Perplexity-User", "Claude-User", "Claude-SearchBot", "ClaudeBot", "DuckAssistBot", "MistralAI-User", "meta-externalagent", "Amazonbot", "Google-CloudVertexBot", "Bytespider", "CCBot"];
const REFS = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "claude.ai", "gemini.google.com", "copilot.microsoft.com"];
const OAI = "https://openai.com/", PPX = "https://www.perplexity.ai/", ANT = "https://claude.com/crawling/bots.json";
const RANGE_URL = { "ChatGPT-User": OAI + "chatgpt-user.json", "OAI-SearchBot": OAI + "searchbot.json", GPTBot: OAI + "gptbot.json", PerplexityBot: PPX + "perplexitybot.json", "Perplexity-User": PPX + "perplexity-user.json", "Claude-User": ANT, "Claude-SearchBot": ANT, ClaudeBot: ANT };

export function classify(ua, referer, url) {
  const u = new URL(url), path = u.pathname.slice(0, 200);
  const bot = BOTS.find((b) => (ua || "").includes(b));
  if (bot) return { agent: bot, kind: "fetch", path };
  let host = "";
  try { host = new URL(referer).hostname; } catch {}
  for (const h of [host, u.searchParams.get("utm_source") || ""]) {
    const agent = h.toLowerCase().replace(/^www\./, "");
    if (REFS.includes(agent)) return { agent, kind: "referral", path };
  }
  return null;
}

// shortcut: IPv6 bot addresses count as unverified, upgrade if vendors move to v6.
export function inCidr(ip, cidr) {
  const num = (s) => { const p = s.split("."); return p.length === 4 && p.every((x) => /^\d{1,3}$/.test(x) && x < 256) ? p.reduce((a, x) => a * 256 + +x, 0) : NaN; };
  const [net, bits = "32"] = cidr.split("/"), a = num((ip || "").replace(/^::ffff:/i, "")), n = num(net);
  if (isNaN(a) || isNaN(n)) return false;
  const size = 2 ** (32 - +bits);
  return Math.floor(a / size) === Math.floor(n / size);
}

const ranges = {}; // per-isolate cache of promises, keyed by vendor URL
const load = (url) => ranges[url] ||= fetch(url, { signal: AbortSignal.timeout(2000) })
  .then((r) => r.json()).then((j) => j.prefixes.map((p) => p.ipv4Prefix).filter(Boolean))
  .catch(() => { delete ranges[url]; return null; }); // a failed download is retried on the next hit, not cached

async function send({ agent, kind, path }, ip) {
  try {
    const url = RANGE_URL[agent], list = url && (await load(url));
    const p_verified = list ? list.some((c) => inCidr(ip, c)) : null;
    await fetch(RPC, {
      method: "POST", signal: AbortSignal.timeout(3000),
      headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_agent: agent, p_kind: kind, p_path: path, p_verified }),
    });
  } catch {}
}

export default async (request, context) => {
  try {
    const hit = classify(request.headers.get("user-agent"), request.headers.get("referer"), request.url);
    if (!hit) return;
    if (context.waitUntil) context.waitUntil(send(hit, context.ip));
    else await send(hit, context.ip);
  } catch {}
};

export const config = {
  path: "/*",
  onError: "bypass", // fail open: an error here must never replace the page with Netlify's error page
  excludedPath: ["/static/*", "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.svg", "/*.ico", "/*.webmanifest", "/*.xml"],
};
