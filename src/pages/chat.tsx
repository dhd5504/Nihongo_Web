import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { BottomBar } from "~/components/BottomBar";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { TopBar } from "~/components/TopBar";

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
        body: JSON.stringify({ messages: nextMessages }),
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
        { role: "assistant", text: `Lỗi: ${fallback}` },
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

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        <LeftBar selectedTab="Chat Bot AI" />
        <main className="flex flex-1 flex-col px-6 py-6 md:ml-32 lg:ml-64">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h1 className="text-2xl font-bold text-gray-800">Chat Bot AI</h1>
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        m.role === "user"
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-800 border border-gray-100"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                      Đang nghĩ...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="min-h-[56px] flex-1 resize-none rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                  <button
                    onClick={() => void sendMessage()}
                    disabled={loading || input.trim() === ""}
                    className="rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Gửi
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
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
