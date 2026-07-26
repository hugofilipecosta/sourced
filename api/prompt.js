// Serverless proxy for prompt generation: holds the Anthropic key server-side
// so the two-step vision prompt chain (see describeImagesLLM/generatePromptLLM
// in index.html) works for every visitor, not only people who paste in their
// own key. Client sends the same {content, max_tokens, temperature} shape it
// would otherwise send straight to the Anthropic Messages API.
const LLM_MODEL = "claude-sonnet-4-6";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    return;
  }
  const { content, max_tokens, temperature } = req.body || {};
  if (!Array.isArray(content) || !content.length) {
    res.status(400).json({ error: "Missing content" });
    return;
  }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: max_tokens || 600,
        temperature: temperature ?? 1,
        messages: [{ role: "user", content }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: data.error?.message || "Model error" });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
