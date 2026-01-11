import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";

type ChatMessage = { role: "user" | "assistant"; text: string };

const GEMINI_MODEL = "gemini-pro";

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

  const systemInstructions = [
    "Bạn là trợ lý AI chuyên nghiệp của Nihongo, app học tiếng Nhật.",
    "Nhiệm vụ: Giải thích từ vựng, ngữ pháp, kanji bằng tiếng Việt thân thiện.",
    "Yêu cầu: Luôn có ví dụ kèm Furigana/Romaji và dịch nghĩa.",
    "Giới hạn: Chỉ trả lời các vấn đề liên quan học tiếng Nhật.",
    "Định dạng: Sử dụng Markdown."
  ].join("\n");

  const contents = messages.map((m, index) => {
    let text = m.text;
    // Chèn chỉ dẫn vào tin nhắn cuối cùng của user để AI luôn nắm được yêu cầu
    if (index === messages.length - 1 && m.role === "user") {
      text = `[SYSTEM: ${systemInstructions}]\n\nNgười dùng hỏi: ${m.text}`;
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    };
  });

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
