"use client";

import { useState, useEffect } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  time: string;
};

type SuggestionBatch = {
  id: number;
  time: string;
  items: string[];
};

export default function Home() {
  const [transcript, setTranscript] = useState([
    "We should improve customer retention this quarter.",
    "Maybe focus on high-value users.",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      items: [
        "Ask which customer segment is dropping the most.",
        "Suggest using retention benchmarks.",
        "Propose a follow-up strategy for churn reduction.",
      ],
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "user",
      text: "What is customer retention strategy?",
      time: new Date().toLocaleTimeString(),
    },
    {
      role: "assistant",
      text: "A customer retention strategy focuses on keeping existing customers engaged...",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");

  const addNewBatch = (newLine: string, newSuggestions: string[]) => {
    setTranscript((prev) => [...prev, newLine]);

    const newBatch: SuggestionBatch = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: newSuggestions,
    };

    setSuggestionBatches((prev) => [newBatch, ...prev]);
  };

  const handleStartMic = () => {
    addNewBatch("Let's analyze churn by segment.", [
      "Ask which segment has highest churn.",
      "Suggest segment-specific retention plan.",
      "Propose targeted campaign for SMB users.",
    ]);
  };

  const handleRefresh = () => {
    addNewBatch("We should compare churn trends month over month.", [
      "Ask whether churn is rising or seasonal.",
      "Suggest comparing SMB vs enterprise churn.",
      "Propose a monthly retention dashboard.",
    ]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: suggestion,
        time: new Date().toLocaleTimeString(),
      },
      {
        role: "assistant",
        text: "This helps move the conversation forward with a more specific next step.",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    let aiReply = "";

    if (input.toLowerCase().includes("retention")) {
      aiReply =
        "Customer retention focuses on keeping existing users engaged through better experience, support, and value.";
    } else if (input.toLowerCase().includes("churn")) {
      aiReply =
        "Churn means customers leaving. You can reduce it by improving onboarding, support, and engagement.";
    } else {
      aiReply =
        "That is a good question. We can explore it further based on the transcript and recent discussion.";
    }

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: input,
        time: new Date().toLocaleTimeString(),
      },
      {
        role: "assistant",
        text: aiReply,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    setInput("");
  };

  const handleExport = () => {
    const sessionData = {
      exportedAt: new Date().toLocaleString(),
      transcript,
      suggestionBatches,
      chatMessages,
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "33%", padding: "16px", borderRight: "1px solid gray" }}>
        <h2>Transcript</h2>

        {transcript.map((line, i) => (
          <p key={i}>{line}</p>
        ))}

        <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleStartMic}
            style={{
              padding: "10px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Start Mic
          </button>

          <button
            onClick={handleRefresh}
            style={{
              padding: "10px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>

          <button
            onClick={handleExport}
            style={{
              padding: "10px 16px",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Export Session
          </button>
        </div>
      </div>

      <div
        style={{
          width: "33%",
          padding: "16px",
          borderRight: "1px solid gray",
          overflowY: "auto",
        }}
      >
        <h2>Live Suggestions</h2>

        {suggestionBatches.map((batch) => (
          <div
            key={batch.id}
            style={{
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div style={{ fontSize: "12px", color: "gray", marginBottom: "8px" }}>
              Batch time: {batch.time}
            </div>

            {batch.items.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s)}
                style={{
                  display: "block",
                  marginBottom: "12px",
                  width: "100%",
                  textAlign: "left",
                  padding: "14px",
                  border: "1px solid gray",
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          width: "33%",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>Chat</h2>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "gray", marginBottom: "4px" }}>
                {msg.time}
              </div>
              <div
                style={{
                  background: msg.role === "user" ? "#eee" : "#cce5ff",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type a message..."
          style={{
            marginTop: "16px",
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
}