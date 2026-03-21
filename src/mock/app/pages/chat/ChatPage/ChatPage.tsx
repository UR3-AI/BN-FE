import { useState } from "react";

import { DeleteIcon, SparklesIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useChatMutation from "@/mock/lib/apis/mutations/chat/useChatMutation/useChatMutation";
import useDeleteChatSessionMutation from "@/mock/lib/apis/mutations/chat/useDeleteChatSessionMutation/useDeleteChatSessionMutation";
import useChatSessionDetailQuery from "@/mock/lib/apis/queries/chat/useChatSessionDetailQuery/useChatSessionDetailQuery";
import useChatSessionsQuery from "@/mock/lib/apis/queries/chat/useChatSessionsQuery/useChatSessionsQuery";
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
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [message, setMessage] = useState("");

  const { data: sessionsData, isLoading: isSessionsLoading } = useChatSessionsQuery();
  const { data: sessionDetail } = useChatSessionDetailQuery(selectedSessionId);
  const chatMutation = useChatMutation();
  const deleteMutation = useDeleteChatSessionMutation();

  const sessions = sessionsData?.items ?? [];
  const messages = sessionDetail?.messages ?? [];

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || chatMutation.isPending) return;

    chatMutation.mutate(
      { message: trimmed, session_id: selectedSessionId || undefined },
      {
        onSuccess: data => {
          setMessage("");
          setSelectedSessionId(data.session_id);
          queryClient.invalidateQueries({ queryKey: ["chat"] });
        },
      },
    );
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
                        {session.message_count} message{session.message_count !== 1 ? "s" : ""}
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
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-[1.6rem]">
                <SparklesIcon
                  size="4.8rem"
                  fill="#ffe2ab"
                />
                <p className="text-[1.6rem] text-on-surface-variant">
                  Start a conversation with your AI assistant
                </p>
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
                      <span
                        className={`mt-[0.4rem] block text-[1rem] ${
                          msg.role === "user" ? "text-on-primary/60" : "text-outline"
                        }`}>
                        {formatTimeAgo(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="rounded-[0.75rem] bg-surface-container px-[1.6rem] py-[1.2rem]">
                      <p className="text-[1.4rem] text-on-surface-variant">Thinking...</p>
                    </div>
                  </div>
                )}
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
                style={{ fieldSizing: "content", maxHeight: "16rem" } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!message.trim() || chatMutation.isPending}
                className="shrink-0 rounded-[0.375rem] bg-primary px-[2rem] py-[1.2rem] text-[1.3rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                {chatMutation.isPending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default ChatPage;
