import test from "node:test";
import assert from "node:assert/strict";
import handler, { classify, inCidr, config } from "../edge-functions/agent-log.js";

const U = "https://nomadswipe.com/alternatives/x.html";
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";

test("fetch agents", () => {
  for (const t of ["ChatGPT-User", "OAI-SearchBot", "GPTBot", "PerplexityBot", "Perplexity-User", "Claude-User", "Claude-SearchBot", "ClaudeBot", "DuckAssistBot", "MistralAI-User", "meta-externalagent", "Amazonbot", "Google-CloudVertexBot", "Bytespider", "CCBot"])
    assert.deepEqual(classify(`Mozilla/5.0 (compatible; ${t}/1.0; +https://x)`, null, U), { agent: t, kind: "fetch", path: "/alternatives/x.html" });
});
test("referrals", () => {
  assert.deepEqual(classify(CHROME, "https://www.perplexity.ai/search?q=x", U), { agent: "perplexity.ai", kind: "referral", path: "/alternatives/x.html" });
  assert.equal(classify(CHROME, null, U + "?utm_source=chatgpt.com").agent, "chatgpt.com");
  assert.equal(classify(CHROME, "https://gemini.google.com/", U).kind, "referral");
});
test("null, query dropped, long path cut", () => {
  assert.equal(classify(CHROME, "https://google.com/", U), null);
  assert.equal(classify(CHROME, null, U + "?utm_source=newsletter"), null);
  assert.equal(classify("ClaudeBot", null, U + "?a=1").path, "/alternatives/x.html");
  assert.equal(classify("ClaudeBot", null, "https://a.com/" + "a".repeat(300)).path.length, 200);
});
test("inCidr", () => {
  assert.equal(inCidr("13.65.138.115", "13.65.138.112/28"), true);
  assert.equal(inCidr("13.65.138.128", "13.65.138.112/28"), false);
  assert.equal(inCidr("1.2.3.4", "1.2.3.4/32"), true);
  assert.equal(inCidr("2001:db8::1", "13.65.138.112/28"), false);
});
test("config excludes assets but not txt", () => {
  assert.equal(config.path, "/*");
  assert.ok(!config.excludedPath.some((p) => p.includes("txt")));
});

test("handler returns undefined and never throws", async () => {
  const real = globalThis.fetch;
  const calls = [];
  const req = (ua) => new Request(U, { headers: { "user-agent": ua } });
  try {
    for (const mode of ["ok", "reject"]) {
      globalThis.fetch = async (url, opts) => {
        calls.push(String(url));
        if (mode === "reject") throw new Error("boom");
        return url.endsWith(".json") ? { json: async () => ({ prefixes: [{ ipv4Prefix: "13.65.138.112/28" }] }) } : { status: 204 };
      };
      const pending = [];
      const ctx = { ip: "13.65.138.115", waitUntil: (p) => pending.push(p) };
      assert.equal(await handler(req("ChatGPT-User"), ctx), undefined);
      assert.equal(pending.length, 1);
      await Promise.all(pending); // must not reject
      assert.equal(await handler(req(CHROME), ctx), undefined);
      assert.equal(pending.length, 1); // human: nothing queued
      assert.equal(await handler(req("CCBot"), { ip: "1.1.1.1" }), undefined); // no waitUntil fallback
    }
    assert.ok(calls.some((c) => c.includes("ns_agent_hit")));
    assert.equal(await handler({ headers: null }, {}), undefined); // malformed request
  } finally { globalThis.fetch = real; }
});
