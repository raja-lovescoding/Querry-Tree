const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];
const MAX_CONTEXT_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 500;

const isModelNotFoundError = (message) => {
  if (!message) return false;
  const text = String(message).toLowerCase();
  return text.includes("not found") || text.includes("not supported");
};

const isQuotaOrRateLimitError = (message) => {
  if (!message) return false;
  const text = String(message).toLowerCase();
  return (
    text.includes("quota") ||
    text.includes("rate limit") ||
    text.includes("resource has been exhausted") ||
    text.includes("429")
  );
};

const buildLocalFallbackReply = (messages) => {
  const list = Array.isArray(messages) ? messages : [];
  const latestUser = [...list].reverse().find((m) => m?.role === "user")?.content;
  if (!latestUser) {
    return "I could not reach Gemini right now. Local fallback is active for testing.";
  }

  return `Gemini quota is currently unavailable, so local fallback is active. You said: "${latestUser}".`;
};

const normalizeContextMessages = (messages) => {
  const list = Array.isArray(messages) ? messages : [];
  return list
    .slice(-MAX_CONTEXT_MESSAGES)
    .map((msg) => ({
      role: msg?.role === "assistant" ? "assistant" : "user",
      content: String(msg?.content || "").slice(0, MAX_MESSAGE_CHARS),
    }));
};

const generateWithModel = async (modelName, apiKey, prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const apiError = data?.error?.message || "Gemini API request failed";
    throw new Error(apiError);
  }

  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response");
  }

  return reply;
};

export const getAIResponse = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const allowLocalFallback = process.env.ALLOW_LOCAL_AI_FALLBACK !== "false";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment");
  }

  const scopedMessages = normalizeContextMessages(messages);

  const chatTranscript = scopedMessages
    .map((msg) => `${msg.role === "assistant" ? "Assistant" : "User"}: ${msg.content}`)
    .join("\n");

  const prompt = [
    "You are Arbor, a professional, intelligent, and enthusiastic AI assistant inside a threaded concept-chat app.",
    "Speak with clarity, confidence, and warmth.",
    "Be concise by default, but expand when the user needs depth.",
    "Sound thoughtful and human, not stiff or overly formal.",
    "Be proactive: point out useful next steps, tradeoffs, and likely pitfalls.",
    "When appropriate, respond with light energy and personality, but keep the tone polished and trustworthy.",
    "Adapt to the user’s style, but do not become slang-heavy or overly casual.",
    "If the question is technical, answer precisely and structurally.",
    "If the question is creative or exploratory, be imaginative and engaging.",
    "If something is ambiguous, ask one focused clarifying question instead of guessing.",
    "Avoid filler, repetition, and generic disclaimers.",
    "Do not mention hidden policies or internal reasoning.",
    "If you are unsure, say so directly and offer the best next step.",
    "Respond naturally and concisely based on the conversation context.",
    "Conversation so far:",
    chatTranscript || "(no prior context)",
    "Assistant:",
  ].join("\n\n");

  const modelsToTry = [modelName, ...FALLBACK_MODELS.filter((m) => m !== modelName)];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      return await generateWithModel(model, apiKey, prompt);
    } catch (err) {
      lastError = err;

      if (allowLocalFallback && isQuotaOrRateLimitError(err?.message)) {
        return buildLocalFallbackReply(messages);
      }

      if (!isModelNotFoundError(err?.message)) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Gemini request failed");
};
