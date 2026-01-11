import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";

type ChatMessage = { role: "user" | "assistant"; text: string };

const GEMINI_MODEL = "gemini-2.5-flash";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "Missing GEMINI_API_KEY" });
  }

  const { messages } = req.body as { messages?: ChatMessage[] };
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array is required" });
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ message: "Gemini request failed", detail: text });
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const reply =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ??
      "Xin loi, toi chua the tra loi luc nay.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini request error", error);
    return res.status(500).json({ message: "Server error" });
  }
}
