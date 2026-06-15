import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { askAgent } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "@/components/ui/textarea";

function ChatBox({ filename, pipelineData, gridData }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!filename) {
      setMessages([]);
      return;
    }

    const hasTable = gridData && gridData.columns && gridData.data && gridData.data.length > 0;

    const welcomeMessage = {
      sender: "agent",
      text: `🤖 **Your Helper**\n\nHello! I am your AI Data Analyst helper. How can I assist you with this dataset?\n\n${hasTable ? "### First 10 Rows Preview:" : ""}`,
      tableData: hasTable ? {
        columns: gridData.columns,
        rows: gridData.data.slice(0, 10)
      } : null
    };

    setMessages([welcomeMessage]);
  }, [filename, pipelineData, gridData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;

    const userMsg = { sender: "user", text: question };
    setMessages(prev => [...prev, userMsg, { sender: "agent", text: "" }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/agent/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename, question: userMsg.text }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to agent");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulatedText += chunk;
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: accumulatedText
              };
            }
            return updated;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: "⚠️ Agent request failed. Please check backend connection."
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col bg-white border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-3 shrink-0">
        <CardTitle className="text-base text-slate-900 font-bold">Your Analyst</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col p-4 min-h-0">
        <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-4 text-sm text-slate-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-none p-3 border ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-850 border-slate-200"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {msg.tableData && (
                  <div className="my-3 overflow-x-auto border border-slate-200 rounded-none bg-white max-w-full">
                    <table className="w-full text-left text-xs text-slate-800">
                      <thead className="bg-slate-50 text-slate-650 text-[10px] font-semibold uppercase border-b border-slate-200">
                        <tr>
                          {msg.tableData.columns.map(col => (
                            <th key={col} className="p-2.5 whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {msg.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            {msg.tableData.columns.map(col => (
                              <td key={col} className="p-2.5 truncate max-w-[150px] font-mono text-[11px] text-slate-700">
                                {row[col] !== null ? String(row[col]) : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 text-slate-500 border border-slate-200 rounded-none p-3 italic">
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="flex gap-2 shrink-0 border-t border-slate-100 pt-3">
          <Textarea
            placeholder="Ask anything about the dataset..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={1}
            className="flex-grow min-h-[40px] h-[40px] max-h-[100px] resize-none border-slate-200 focus:ring-slate-400 py-2.5"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <Button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="px-4 bg-slate-900 hover:bg-slate-850 text-white font-semibold h-10 shrink-0"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatBox;