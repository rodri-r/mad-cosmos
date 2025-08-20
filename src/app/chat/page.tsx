// src/app/chat/page.tsx
"use client";

import { useState } from "react";
import "./chat.css";  

export default function Chat() {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const send = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");   

    try {
      const res = await fetch(
        "https://chatapi.akash.network/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AKASH_API_KEY}`,
          },
          body: JSON.stringify({
            model: "Meta-Llama-3-1-8B-Instruct-FP8",
            messages: [{ role: "user", content: input }],
          }),
        }
      );

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content ?? "No response";
      setResponse(answer);
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  return (
    <div className="chat-page">
      <h1 className="chat-title">Ask AI about crypto!</h1>

      <div className="chat-container">
        {/* ----- Text input ----- */}
        <input
          type="text"
          placeholder="Ask me anything about crypto…"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />

        <button
          className="chat-button"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          Send
        </button>

        {loading && (
          <div className="chat-loading">
            <div className="chat-loading__spinner" />
            <span>Thinking…</span>
          </div>
        )}

        {response && (
          <div className="chat-response">
            <h3>Response:</h3>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
