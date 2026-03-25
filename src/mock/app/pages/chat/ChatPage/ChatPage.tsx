import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DeleteIcon, SparklesIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import type { ChatSourceNote } from "@/mock/lib/apis/mutations/chat/useChatMutation/useChatMutation.type";
import useDeleteChatSessionMutation from "@/mock/lib/apis/mutations/chat/useDeleteChatSessionMutation/useDeleteChatSessionMutation";
import useChatSessionDetailQuery from "@/mock/lib/apis/queries/chat/useChatSessionDetailQuery/useChatSessionDetailQuery";
import useChatSessionsQuery from "@/mock/lib/apis/queries/chat/useChatSessionsQuery/useChatSessionsQuery";
import useAuthStore from "@lib/stores/useAuthStore/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

const formatTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
};

const ChatPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const accessToken = useAuthStore(s => s.accessToken);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPhase, setStreamPhase] = useState<
    "searching" | "analyzing" | "generating" | "idle"
  >("idle");
  const [displayText, setDisplayText] = useState("");
  const [streamingSources, setStreamingSources] = useState<ChatSourceNote[]>(
    [],
  );
  const [streamError, setStreamError] = useState("");
  const [pendingUserMessage, setPendingUserMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const tokenQueueRef = useRef<string[]>([]);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(0);

  const { data: sessionsData, isLoading: isSessionsLoading } =
    useChatSessionsQuery();
  const { data: sessionDetail } = useChatSessionDetailQuery(selectedSessionId);
  const deleteMutation = useDeleteChatSessionMutation();

  const sessions = sessionsData?.items ?? [];
  const messages = sessionDetail?.messages ?? [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 토큰 큐를 프레임 단위로 소비하여 타이핑 효과
  const lastScrollRef = useRef(0);
  const flushQueue = useCallback((timestamp: number) => {
    const queue = tokenQueueRef.current;
    if (queue.length === 0) {
      rafRef.current = 0;
      // 큐 끝나면 마지막 스크롤
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // 약 20ms 간격으로 한 토큰씩 (50 chars/sec 체감)
    if (timestamp - lastFrameRef.current >= 20) {
      const chunk = queue.splice(0, 1).join("");
      setDisplayText(prev => prev + chunk);
      lastFrameRef.current = timestamp;
      // 500ms 간격으로 throttle된 스크롤
      if (timestamp - lastScrollRef.current >= 500) {
        lastScrollRef.current = timestamp;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    rafRef.current = requestAnimationFrame(flushQueue);
  }, []);

  const enqueueTokens = useCallback(
    (text: string) => {
      tokenQueueRef.current.push(...text.split(""));
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushQueue);
      }
    },
    [flushQueue],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 메시지 추가 시에만 스크롤 (스트리밍 중에는 flushQueue에서 throttle 처리)
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isStreaming) return;

    setMessage("");
    setPendingUserMessage(trimmed);
    setIsStreaming(true);
    setStreamPhase("searching");
    setDisplayText("");
    tokenQueueRef.current = [];
    setStreamingSources([]);
    setStreamError("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Ensure fresh token before SSE (bypasses Axios interceptor)
      let token = accessToken;
      const { expiresAt, refreshToken } = useAuthStore.getState();
      if (expiresAt && Date.now() > expiresAt - 60_000 && refreshToken) {
        try {
          const { default: refreshTokenAsync } =
            await import("@lib/apis/services/auth/refreshTokenAsync/refreshTokenAsync");
          const refreshed = await refreshTokenAsync(refreshToken);
          useAuthStore
            .getState()
            .setTokens(
              refreshed.access_token,
              refreshed.refresh_token,
              refreshed.expires_in,
            );
          token = refreshed.access_token;
        } catch {
          // Token refresh failed — proceed with current token
          // Axios interceptor will handle 401 on subsequent requests
        }
      }

      const response = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: trimmed,
          session_id: selectedSessionId || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              switch (currentEvent) {
                case "session":
                  setSelectedSessionId(data.session_id);
                  break;
                case "sources":
                  setStreamingSources(data.notes ?? []);
                  setStreamPhase("analyzing");
                  break;
                case "token":
                  // React는 동일 값 setState를 최적화하므로 무조건 호출해도 리렌더 1회만 발생
                  setStreamPhase("generating");
                  enqueueTokens(data.text);
                  break;
                case "completed":
                  setPendingUserMessage("");
                  // 큐에 남은 토큰을 즉시 flush한 뒤, 서버 데이터로 교체 (깜빡임 방지)
                  setDisplayText(
                    prev => prev + tokenQueueRef.current.splice(0).join(""),
                  );
                  if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = 0;
                  }
                  await queryClient
                    .refetchQueries({ queryKey: ["chat"] })
                    .catch(() => {});
                  setDisplayText("");
                  setStreamingSources([]);
                  break;
                case "failed":
                  setStreamError(data.error ?? "An error occurred");
                  break;
              }
            } catch {
              // Skip malformed SSE data lines
            }
            currentEvent = "";
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setStreamError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      // 현재 controller가 여전히 활성 요청인 경우에만 상태 정리
      // (abort 후 재전송 시 이전 finally가 새 요청 상태를 오염하지 않도록)
      if (abortRef.current === controller || abortRef.current === null) {
        setIsStreaming(false);
        setStreamPhase("idle");
        setPendingUserMessage("");
        tokenQueueRef.current = [];
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      }
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!window.confirm("Delete this chat session?")) return;
    deleteMutation.mutate(sessionId, {
      onSuccess: () => {
        if (selectedSessionId === sessionId) {
          setSelectedSessionId("");
        }
        queryClient.invalidateQueries({ queryKey: ["chat"] });
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showStreamingBubble = isStreaming || displayText || pendingUserMessage;

  return (
    <GlobalLayout breadcrumb={[{ label: "Chat", active: true }]}>
      <div className="flex flex-1">
        {/* Session List */}
        <div className="hidden w-[28rem] shrink-0 flex-col border-r border-outline-variant/10 bg-surface-container-lowest lg:flex">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-[1.6rem] py-[1.6rem]">
            <h2 className="text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Sessions
            </h2>
            <button
              type="button"
              onClick={() => setSelectedSessionId("")}
              className="rounded-[0.375rem] bg-primary px-[1.2rem] py-[0.6rem] text-[1.1rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95">
              New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSessionsLoading ? (
              <div className="px-[1.6rem] py-[4.8rem] text-center text-[1.2rem] text-on-surface-variant">
                Loading...
              </div>
            ) : sessions.length === 0 ? (
              <div className="px-[1.6rem] py-[4.8rem] text-center text-[1.2rem] text-on-surface-variant">
                No sessions yet
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.session_id}
                  className={`group relative cursor-pointer px-[1.6rem] py-[1.2rem] transition-colors hover:bg-surface-container ${
                    session.session_id === selectedSessionId
                      ? "border-l-2 border-primary bg-surface-container-highest"
                      : "border-l-2 border-transparent"
                  }`}>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionId(session.session_id)}
                    className="w-full text-left">
                    <p className="truncate pr-[3.2rem] text-[1.3rem] font-semibold text-on-surface">
                      {session.title ?? "New Chat"}
                    </p>
                    <div className="mt-[0.4rem] flex items-center gap-[0.8rem]">
                      <span className="text-[1rem] text-on-surface-variant">
                        {formatTimeAgo(session.updated_at)}
                      </span>
                      <span className="text-[1rem] text-outline">
                        {session.message_count} message
                        {session.message_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteSession(session.session_id);
                    }}
                    className="absolute top-[1.2rem] right-[1.2rem] rounded-[0.25rem] p-[0.4rem] text-on-surface-variant opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100"
                    title="Delete">
                    <DeleteIcon
                      size="1.4rem"
                      fill="currentColor"
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-[3.2rem] py-[3.2rem]">
            {messages.length === 0 && !showStreamingBubble ? (
              <div className="flex h-full flex-col items-center justify-center gap-[2.4rem]">
                <div className="relative">
                  <div
                    className="absolute inset-0 animate-ping rounded-full bg-primary/10"
                    style={{ animationDuration: "3s" }}
                  />
                  <SparklesIcon
                    size="5.6rem"
                    fill="#ffe2ab"
                  />
                </div>
                <div className="text-center">
                  <h3 className="mb-[0.8rem] font-headline text-[2.2rem] font-bold text-on-surface">
                    AI Assistant
                  </h3>
                  <p className="text-[1.4rem] text-on-surface-variant/60">
                    Ask anything about your notes, get summaries, or explore
                    connections.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-[0.8rem]">
                  {[
                    "Summarize my recent notes",
                    "Find connections between topics",
                    "What are my pending tasks?",
                  ].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setMessage(q);
                      }}
                      className="rounded-full border border-outline-variant/20 px-[1.6rem] py-[0.8rem] text-[1.2rem] text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[72rem] space-y-[2.4rem]">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-[0.75rem] px-[1.6rem] py-[1.2rem] ${
                        msg.role === "user"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface"
                      }`}>
                      <p className="whitespace-pre-wrap text-[1.4rem] leading-relaxed">
                        {msg.content}
                      </p>
                      {msg.role === "assistant" && msg.sources.length > 0 && (
                        <div className="mt-[0.8rem] flex flex-wrap gap-[0.6rem] border-t border-outline-variant/10 pt-[0.8rem]">
                          {msg.sources.map(src => (
                            <button
                              type="button"
                              key={src.note_number}
                              onClick={() =>
                                navigate("/", {
                                  state: { noteNumber: src.note_number },
                                })
                              }
                              className="cursor-pointer rounded-full bg-surface-container-highest px-[0.8rem] py-[0.2rem] text-[1rem] text-secondary transition-colors hover:bg-primary/20 hover:text-primary">
                              Note #{src.note_number}
                              {src.title ? ` — ${src.title}` : ""}
                            </button>
                          ))}
                        </div>
                      )}
                      <span
                        className={`mt-[0.4rem] block text-[1rem] ${
                          msg.role === "user"
                            ? "text-on-primary/60"
                            : "text-outline"
                        }`}>
                        {formatTimeAgo(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Optimistic user message */}
                {pendingUserMessage && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-[0.75rem] bg-primary px-[1.6rem] py-[1.2rem] text-on-primary">
                      <p className="whitespace-pre-wrap text-[1.4rem] leading-relaxed">
                        {pendingUserMessage}
                      </p>
                      <span className="mt-[0.4rem] block text-[1rem] text-on-primary/60">
                        just now
                      </span>
                    </div>
                  </div>
                )}

                {/* Streaming assistant response */}
                {showStreamingBubble && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-[0.75rem] bg-surface-container px-[1.6rem] py-[1.2rem] text-on-surface">
                      {displayText ? (
                        <p className="whitespace-pre-wrap text-[1.4rem] leading-relaxed">
                          {displayText}
                          <span className="inline-block h-[1.4rem] w-[0.2rem] animate-pulse bg-primary" />
                        </p>
                      ) : (
                        <div className="space-y-[1rem]">
                          {/* Phase: Searching */}
                          <div className="flex items-center gap-[1rem]">
                            {streamPhase === "searching" ? (
                              <div className="h-[1.6rem] w-[1.6rem] animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                            ) : (
                              <span className="text-[1.2rem]">✓</span>
                            )}
                            <span
                              className={`text-[1.3rem] ${streamPhase === "searching" ? "text-on-surface" : "text-on-surface-variant/40"}`}>
                              Searching your notes...
                            </span>
                          </div>

                          {/* Phase: Analyzing (sources 도착 후) */}
                          {(streamPhase === "analyzing" ||
                            streamPhase === "generating") && (
                            <div className="flex items-center gap-[1rem]">
                              {streamPhase === "analyzing" ? (
                                <div className="h-[1.6rem] w-[1.6rem] animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                              ) : (
                                <span className="text-[1.2rem]">✓</span>
                              )}
                              <span
                                className={`text-[1.3rem] ${streamPhase === "analyzing" ? "text-on-surface" : "text-on-surface-variant/40"}`}>
                                Analyzing {streamingSources.length} source
                                {streamingSources.length !== 1 ? "s" : ""}...
                              </span>
                            </div>
                          )}

                          {/* Phase: Generating */}
                          {streamPhase === "generating" && (
                            <div className="flex items-center gap-[1rem]">
                              <div className="flex gap-[0.3rem]">
                                <span
                                  className="inline-block h-[0.6rem] w-[0.6rem] animate-bounce rounded-full bg-primary/60"
                                  style={{ animationDelay: "0ms" }}
                                />
                                <span
                                  className="inline-block h-[0.6rem] w-[0.6rem] animate-bounce rounded-full bg-primary/60"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <span
                                  className="inline-block h-[0.6rem] w-[0.6rem] animate-bounce rounded-full bg-primary/60"
                                  style={{ animationDelay: "300ms" }}
                                />
                              </div>
                              <span className="text-[1.3rem] text-on-surface">
                                Generating response...
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sources */}
                      {streamingSources.length > 0 && (
                        <div className="mt-[0.8rem] flex flex-wrap gap-[0.6rem] border-t border-outline-variant/10 pt-[0.8rem]">
                          {streamingSources.map(src => (
                            <button
                              type="button"
                              key={src.note_number}
                              onClick={() =>
                                navigate("/", {
                                  state: { noteNumber: src.note_number },
                                })
                              }
                              className="cursor-pointer rounded-full bg-surface-container-highest px-[0.8rem] py-[0.2rem] text-[1rem] text-secondary transition-colors hover:bg-primary/20 hover:text-primary">
                              Note #{src.note_number}
                              {src.title ? ` — ${src.title}` : ""}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {streamError && (
                  <div className="flex justify-start">
                    <div className="rounded-[0.75rem] bg-error-container/20 px-[1.6rem] py-[1.2rem]">
                      <p className="text-[1.4rem] text-error">{streamError}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-outline-variant/10 px-[3.2rem] py-[2rem]">
            <div className="mx-auto flex max-w-[72rem] items-end gap-[1.2rem]">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none rounded-[0.5rem] border border-outline-variant/20 bg-surface-container-low px-[1.6rem] py-[1.2rem] text-[1.4rem] text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                style={
                  {
                    fieldSizing: "content",
                    maxHeight: "16rem",
                  } as React.CSSProperties
                }
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!message.trim() || isStreaming}
                className="shrink-0 rounded-[0.375rem] bg-primary px-[2rem] py-[1.2rem] text-[1.3rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                {isStreaming ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default ChatPage;
