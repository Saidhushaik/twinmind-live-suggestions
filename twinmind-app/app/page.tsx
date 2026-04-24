"use client";

import { useState } from "react";

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

const feed = [
  "We should improve customer retention this quarter.",
  "Maybe focus on high-value users.",
  "Let's analyze churn by customer segment.",
  "SMB users are dropping more after the first 30 days.",
  "Enterprise users seem stable, but SMB churn is increasing.",
  "We should compare churn trends month over month.",
  "The team wants a clear next step before the next meeting.",
];

export default function Home() {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [feedIndex, setFeedIndex] = useState(0);
  const [input, setInput] = useState("");

  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "user",
      text: "What is customer retention strategy?",
      time: new Date().toLocaleTimeString(),
    },
    {
      role: "assistant",
      text:
        "Customer retention means keeping existing customers engaged and reducing churn. Based on this meeting, the best next step is to identify which segment is at risk and why.",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const buildSuggestions = (lines: string[]) => {
    const recentText = lines.slice(-3).join(" ").toLowerCase();

    if (recentText.includes("first 30 days") || recentText.includes("smb")) {
      return [
        "Ask whether SMB churn is caused by onboarding, pricing, or product fit.",
        "Suggest a 30-day SMB retention experiment with targeted onboarding help.",
        "Point out that enterprise users seem stable, so SMB needs a separate plan.",
      ];
    }

    if (recentText.includes("month over month") || recentText.includes("trends")) {
      return [
        "Ask if the churn spike aligns with a product release, pricing change, or campaign.",
        "Suggest comparing churn by cohort instead of only using monthly averages.",
        "Recommend checking whether the change is seasonal or tied to recent user behavior.",
      ];
    }

    if (recentText.includes("next step") || recentText.includes("meeting")) {
      return [
        "Propose ending the meeting with one owner, one metric, and one follow-up date.",
        "Suggest defining success as a measurable churn reduction for one segment.",
        "Ask which retention action can be tested this week instead of waiting for more analysis.",
      ];
    }

    if (recentText.includes("retention") || recentText.includes("high-value")) {
      return [
        "Clarify whether the team is prioritizing high-value users or the largest churn segment.",
        "Suggest identifying early churn signals before customers become inactive.",
        "Ask which retention metric matters most: churn rate, engagement, or renewal likelihood.",
      ];
    }

    return [
      "Ask a sharper follow-up question based on the latest point.",
      "Suggest one concrete action the team can take next.",
      "Provide a quick clarification tied to the recent transcript.",
    ];
  };

  const addBatch = (newLine: string) => {
    const updatedTranscript = [...transcript, newLine];
    const newSuggestions = buildSuggestions(updatedTranscript);

    setTranscript(updatedTranscript);

    const newBatch: SuggestionBatch = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: newSuggestions,
    };

    setSuggestionBatches((prev) => {
      const latest = prev[0];

      if (
        latest &&
        JSON.stringify(latest.items) === JSON.stringify(newSuggestions)
      ) {
        return prev;
      }

      return [newBatch, ...prev];
    });
  };

  const handleStartMic = () => {
    if (feedIndex >= feed.length) return;

    const nextLine = feed[feedIndex];

    if (!transcript.includes(nextLine)) {
      addBatch(nextLine);
    }

    setFeedIndex((prev) => prev + 1);
  };

  const handleRefresh = () => {
    const refreshIdeas = [
      "The team is discussing whether churn is driven by onboarding gaps.",
      "A pricing change may have affected SMB users more than enterprise users.",
      "Support tickets increased for newer SMB customers last month.",
      "The team needs one measurable retention experiment before next week.",
    ];

    const nextLine = refreshIdeas[feedIndex % refreshIdeas.length];

    if (!transcript.includes(nextLine)) {
      addBatch(nextLine);
    } else {
      const smartBatch: SuggestionBatch = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        items: buildSuggestions([...transcript, nextLine]).map(
          (item) => item + " (based on latest context)"
        ),
      };

      setSuggestionBatches((prev) => [smartBatch, ...prev]);
    }

    setFeedIndex((prev) => prev + 1);
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
        text:
          `Detailed answer: ${suggestion}\n\n` +
          "Based on the current transcript, this is useful because the discussion is moving from a broad retention problem toward a more specific segment-level decision. The strongest next step is to convert this into one measurable action, assign an owner, and track the outcome in the next meeting.",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input;
    const lower = userText.toLowerCase();

    let aiReply =
      "That is a good question. Based on the current transcript, I would connect the answer back to the latest discussion and turn it into a clear next step.";

    if (lower.includes("churn")) {
      aiReply =
        "Churn means customers leaving or stopping use of the product. In this transcript, the key insight is that SMB churn appears higher than enterprise churn, so the team should avoid a generic retention plan and focus on the SMB segment first.";
    }

    if (lower.includes("retention")) {
      aiReply =
        "A strong retention strategy should identify the at-risk segment, find the reason they leave, and test a targeted intervention. Here, the best first experiment is likely a 30-day SMB onboarding or support improvement.";
    }

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userText,
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <div style={{ width: "33%", padding: "16px", borderRight: "1px solid gray" }}>
        <h2>Transcript</h2>

        {transcript.length === 0 ? (
          <p style={{ color: "gray" }}>Click Start Mic to begin transcript.</p>
        ) : (
          transcript.map((line, i) => <p key={i}>{line}</p>)
        )}

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

        {suggestionBatches.length === 0 ? (
          <p style={{ color: "gray" }}>Suggestions will appear after transcript starts.</p>
        ) : (
          suggestionBatches.map((batch) => (
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
                    fontSize: "15px",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          ))
        )}
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
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
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