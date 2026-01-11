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

  const { messages, level } = req.body as { messages?: ChatMessage[], level?: string };
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array is required" });
  }

  const userLevel = level || "N5";
  const systemPrompt = `[VAI TRÒ: Bạn là trợ lý AI của dự án Nihongo. TRÌNH ĐỘ NGƯỜI DÙNG: ${userLevel}. GIỚI HẠN: Chỉ trả lời về tiếng Nhật. YÊU CẦU: Giải thích ngữ pháp/từ vựng phù hợp với trình độ ${userLevel}, luôn có ví dụ kèm Furigana/Romaji và dịch nghĩa. PHONG CÁCH: Thân thiện, sử dụng tiếng Việt.]\n\n`;

  const contents = messages.map((m, index) => {
    // Chỉ lồng prompt vào tin nhắn đầu tiên của cuộc hội thoại để thiết lập ngữ cảnh mà không làm tốn dung lượng các tin nhắn sau
    const text = (index === 0 && m.role === "user")
      ? systemPrompt + m.text
      : m.text;

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
