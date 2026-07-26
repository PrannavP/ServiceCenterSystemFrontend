import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { BsRobot, BsStars } from "react-icons/bs";
import { FiSend, FiX, FiChevronDown } from "react-icons/fi";

import useAuthApi from "../../api/useAuthApi";
import "../../styles/chatbot.css";

const STORAGE_KEY = "aria.chat.history";

const WELCOME = {
    role: "assistant",
    reply:
        "Hi! I'm **Aria**, your service center assistant. Ask me for live numbers on job cards, parts and billing or how to get things done.",
    suggestions: [
        "How many job cards do we have?",
        "Show low stock parts",
        "Revenue this month",
        "How do I create a job card?",
    ],
    cards: [],
    actions: [],
};

// Minimal, safe markdown-lite: **bold** and bullet lines. No raw HTML injection.
function renderText(text) {
    return String(text)
        .split("\n")
        .map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
                seg.startsWith("**") && seg.endsWith("**") ? (
                    <strong key={j}>{seg.slice(2, -2)}</strong>
                ) : (
                    <span key={j}>{seg}</span>
                )
            );
            return (
                <span key={i}>
                    {parts}
                    {i < text.split("\n").length - 1 && <br />}
                </span>
            );
        });
}

function StatCard({ card }) {
    return (
        <div className="aria-card">
            {card.title && <div className="aria-card-title">{card.title}</div>}
            <div className="aria-stat-grid">
                {card.stats?.map((s, i) => (
                    <div className="aria-stat" key={i}>
                        <div className="val">{s.value}</div>
                        <div className="lbl">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TableCard({ card }) {
    const rows = card.rows || [];
    const columns = rows.length ? Object.keys(rows[0]) : [];
    return (
        <div className="aria-card">
            {card.title && <div className="aria-card-title">{card.title}</div>}
            <table className="aria-table">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            {columns.map((c) => (
                                <td key={c}>{r[c]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Cards({ cards }) {
    if (!cards?.length) return null;
    return (
        <div className="aria-cards">
            {cards.map((card, i) =>
                card.type === "stat" ? <StatCard card={card} key={i} /> : <TableCard card={card} key={i} />
            )}
        </div>
    );
}

export default function ChatWidget() {
    const navigate = useNavigate();
    const { callApi } = useAuthApi();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (_) {}
        return [WELCOME];
    });
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);

    const panelRef = useRef(null);
    const bodyRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
        } catch (_) {}
    }, [messages]);

    // Scroll to newest
    useEffect(() => {
        if (open && bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, busy, open]);

    // Entrance animation
    useEffect(() => {
        if (open && panelRef.current) {
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, y: 24, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.5)" }
            );
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open]);

    const send = useCallback(
        async (raw) => {
            const text = (raw ?? input).trim();
            if (!text || busy) return;

            const nextHistory = [...messages, { role: "user", reply: text }];
            setMessages(nextHistory);
            setInput("");
            setBusy(true);

            const apiHistory = nextHistory
                .filter((m) => m.reply)
                .slice(-8)
                .map((m) => ({ role: m.role, content: m.reply }));

            const data = await callApi({
                url: "/api/chatbot/chat",
                method: "POST",
                body: { message: text, history: apiHistory },
                skipAuthRedirect: true,
            });

            if (data && data.reply) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        reply: data.reply,
                        cards: data.cards || [],
                        actions: data.actions || [],
                        suggestions: data.suggestions || [],
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        reply: "I couldn't reach the service just now. Please check your connection and try again.",
                        cards: [],
                        actions: [],
                        suggestions: [],
                    },
                ]);
            }
            setBusy(false);
        },
        [input, busy, messages, callApi]
    );

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const goTo = (path) => {
        navigate(path);
        setOpen(false);
    };

    const resetChat = () => {
        setMessages([WELCOME]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
    };

    return (
        <>
            {!open && (
                <button className="aria-fab" onClick={() => setOpen(true)} aria-label="Open assistant">
                    <span className="aria-fab-dot" />
                    <BsStars />
                </button>
            )}

            {open && (
                <div className="aria-panel" ref={panelRef} role="dialog" aria-label="Aria assistant">
                    <div className="aria-header">
                        <div className="aria-avatar">
                            <BsRobot size={22} />
                        </div>
                        <div className="aria-header-meta">
                            <div className="aria-name">Aria</div>
                            <div className="aria-status">
                                <span className="dot" /> Service Center Assistant
                            </div>
                        </div>
                        <button onClick={resetChat} title="Clear conversation" aria-label="Clear">
                            <BsStars size={15} />
                        </button>
                        <button onClick={() => setOpen(false)} title="Minimize" aria-label="Close">
                            <FiChevronDown size={18} />
                        </button>
                    </div>

                    <div className="aria-body" ref={bodyRef}>
                        {messages.map((m, i) => {
                            const isUser = m.role === "user";
                            return (
                                <div key={i}>
                                    <div className={`aria-row ${isUser ? "user" : "assistant"}`}>
                                        <div className="aria-msg-avatar">{isUser ? "You"[0] : <BsRobot size={15} />}</div>
                                        <div className="aria-bubble">{renderText(m.reply)}</div>
                                    </div>

                                    {!isUser && <Cards cards={m.cards} />}

                                    {!isUser && m.actions?.length > 0 && (
                                        <div className="aria-actions">
                                            {m.actions.map((a, j) => (
                                                <button className="aria-action-btn" key={j} onClick={() => goTo(a.path)}>
                                                    {a.label} →
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {busy && (
                            <div className="aria-row assistant">
                                <div className="aria-msg-avatar">
                                    <BsRobot size={15} />
                                </div>
                                <div className="aria-bubble" style={{ padding: 0 }}>
                                    <div className="aria-typing">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions from the latest assistant message */}
                    {(() => {
                        const last = [...messages].reverse().find((m) => m.role === "assistant");
                        if (busy || !last?.suggestions?.length) return null;
                        return (
                            <div className="aria-suggestions">
                                {last.suggestions.map((s, i) => (
                                    <button className="aria-chip" key={i} onClick={() => send(s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        );
                    })()}

                    <div className="aria-footer">
                        <div className="aria-input-wrap">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                placeholder="Ask about job cards, parts, billing…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                            />
                            <button className="aria-send" onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send">
                                <FiSend size={17} />
                            </button>
                        </div>
                        <div className="aria-hint">
                            <BsStars size={9} style={{ verticalAlign: "middle" }} /> Aria reads your live service-center data
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
