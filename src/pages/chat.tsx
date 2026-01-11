import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";
import { Volume2 } from "lucide-react";
import Cookies from "js-cookie";

type Message = { role: "user" | "assistant"; text: string };

const ChatPage: NextPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Chào bạn! Tôi là trợ lý AI của Nihongo. Bạn muốn luyện tập gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const userLevel = Cookies.get("level") || "N5";

  // Task: Phát âm tiếng Nhật (TTS)
  const speak = (text: string) => {
    // Lọc bỏ các đoạn không phải tiếng Nhật nếu cần, hoặc đọc hết
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; // Thiết lập ngôn ngữ là tiếng Nhật
    window.speechSynthesis.speak(utterance);
  };

  const starters = [
    "Chào Nihongo! 👋",
    "Giải thích ngữ pháp N5",
    "Dịch câu: 'Tôi thích học tiếng Nhật'",
    "5 từ vựng về chủ đề ăn uống",
  ];

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMessage: Message = { role: "user", text: trimmed };
    const nextMessages: Message[] = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, level: userLevel }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Request failed");
      }

      const data = (await res.json()) as { reply: string };
      setMessages([...nextMessages, { role: "assistant", text: data.reply }]);
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : "Không gửi được tin nhắn.";
      setMessages([
        ...nextMessages,
        { role: "assistant", text: `Rất tiếc, AI đang bận hoặc đã hết lượt yêu cầu miễn phí. Bạn hãy nâng cấp hoặc đăng ký gói Premium để tiếp tục, hoặc vui lòng đợi một lát rồi thử lại nhé! 🙏` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  // Hàm hỗ trợ in đậm các đoạn bao quanh bởi **
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftBar selectedTab="Chat" />
        <main className="flex flex-1 flex-col md:ml-32 lg:ml-64 overflow-hidden pt-[58px] pb-[88px] md:pt-0 md:pb-0">
          <div className="mx-auto flex h-full w-full max-w-4xl flex-col bg-white shadow-sm md:rounded-2xl md:border-2 md:border-gray-200 md:my-4 overflow-hidden">
            <h1 className="text-xl font-bold text-gray-800 md:text-2xl">Chat</h1>
            <div className="flex flex-1 flex-col overflow-hidden min-h-0">
              <div className="flex-1 space-y-3 overflow-y-auto p-3 md:p-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`relative max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow-sm md:px-4 ${m.role === "user"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-800 border border-gray-100"
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex-1">
                          {formatText(m.text)}
                        </span>
                        {m.role === "assistant" && (
                          <button
                            onClick={() => speak(m.text)}
                            className="mt-0.5 text-gray-400 hover:text-green-500 transition-colors"
                            title="Phát âm tiếng Nhật"
                          >
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm md:px-4">
                      Đang nghĩ...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Task: Chat Starters (Gợi ý câu hỏi) - Chỉ hiện khi chưa có hội thoại */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 p-2 bg-white border-t border-gray-100">
                  {starters.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:border-green-400 hover:bg-green-50 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 bg-white p-2 md:p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="min-h-[48px] flex-1 resize-none rounded-2xl border border-gray-200 p-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 md:min-h-[56px] md:p-3"
                  />
                  <button
                    onClick={() => void sendMessage()}
                    disabled={loading || input.trim() === ""}
                    className="rounded-2xl bg-green-500 px-3 py-2 text-sm font-bold uppercase text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300 md:px-4 md:py-3"
                  >
                    Gửi
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400 md:mt-2">
                  Enter để gửi, Shift+Enter để xuống dòng.
                </p>
              </div>
            </div>
          </div>
        </main>
        <RightBar />
      </div>
      <BottomBar selectedTab={null} />
    </div>
  );
};

export default ChatPage;
