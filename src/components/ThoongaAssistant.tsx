"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    isTyping?: boolean;
}

const QUICK_ACTIONS = [
    { label: "Report Waste", key: "waste_reporting" },
    { label: "Hospital Monitoring", key: "hospitals" },
    { label: "River Protection", key: "vaigai_river" },
    { label: "System Impact", key: "impact" },
    { label: "Contact Municipality", key: "contact" }
];

export default function ThoongaAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showBadge, setShowBadge] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        // Auto-greeting logic
        const hasGreeted = sessionStorage.getItem("thoonga_greeted");
        if (messages.length === 0) {
            const greetingText = !hasGreeted
                ? "Vanakkam! I am Thoonga Assistant, your guide for Madurai's urban intelligence. How can I help you keep our city clean today?"
                : "Welcome back! Ask me anything about Waste Reporting, Hospital Monitoring, or Vaigai Protection.";

            setMessages([
                {
                    id: "greeting",
                    text: greetingText,
                    sender: "bot",
                    timestamp: new Date()
                }
            ]);
            sessionStorage.setItem("thoonga_greeted", "true");
        }
    }, [messages.length]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: messages.slice(-5)
                })
            });

            const data = await response.json();

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm sorry, I encountered an error. How else can I help?",
                sender: "bot",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. You can still report waste via the dashboard!",
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAction = (key: string) => {
        const action = QUICK_ACTIONS.find(a => a.key === key);
        if (!action) return;
        handleSend(action.label);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (showBadge) setShowBadge(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={toggleChat}
                        className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,242,96,0.3)] border border-primary-green/20 cursor-pointer relative group overflow-hidden"
                        aria-label="Open Thoonga Assistant"
                    >
                        {/* Soft Glow Shadow */}
                        <div className="absolute inset-0 rounded-full bg-primary-green/20 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />

                        {/* Logo with scaling animation */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 w-full h-full p-2 flex items-center justify-center bg-white"
                        >
                            <img
                                src="/chatbot-logo.png"
                                alt="Thoonga Assistant Logo"
                                className="w-12 h-12 object-contain"
                            />
                        </motion.div>

                        {/* Notification Badge */}
                        {showBadge && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-1 right-1 w-4 h-4 bg-primary-green rounded-full border-2 border-white z-20"
                            />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="w-[400px] h-[640px] max-h-[88vh] max-w-[92vw] glass-card flex flex-col border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden rounded-[16px]"
                    >
                        {/* Header */}
                        <div className="relative h-[110px] border-b border-white/10 overflow-hidden bg-gradient-to-r from-emerald-950 to-emerald-900 flex items-center px-5 flex-shrink-0">
                            {/* Madurai Skyline Watermark */}
                            <div className="absolute inset-x-0 bottom-0 opacity-10 pointer-events-none select-none">
                                <svg viewBox="0 0 400 60" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 60V50L20 52L30 40L40 50L60 55L80 40L100 50L120 20L140 50L160 55L180 5L200 50L220 55L240 20L260 50L280 40L300 55L320 40L330 52L350 50V60H0Z" />
                                </svg>
                            </div>

                            <div className="flex items-center gap-4 relative z-10 w-full">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl flex-shrink-0 p-1">
                                    <img
                                        src="/chatbot-logo.png"
                                        alt="Assistant Logo"
                                        className="w-14 h-14 object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold tracking-tight text-white leading-tight">Thoonga Assistant</h3>
                                    <p className="text-[10px] text-primary-green font-bold uppercase tracking-wider mt-0.5">The chatbot for cleaner Madurai</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-black/20">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm ${msg.sender === "user"
                                            ? "bg-[#2962FF]/30 border border-[#2962FF]/40 rounded-2xl rounded-tr-none text-white"
                                            : "bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-gray-200"
                                            }`}
                                    >
                                        {msg.text.split("\n").map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < msg.text.split("\n").length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Animation */}
                            <AnimatePresence>
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 px-4">
                                            <div className="flex gap-1.5">
                                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-gray-400" />
                                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-gray-400" />
                                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-gray-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="px-5 py-3 flex flex-wrap gap-2 overflow-x-auto bg-black/40 border-t border-white/5">
                            {QUICK_ACTIONS.map((action) => (
                                <button
                                    key={action.key}
                                    onClick={() => handleQuickAction(action.key)}
                                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold hover:bg-white/10 hover:border-white/20 hover:text-primary-green transition-all whitespace-nowrap text-gray-400"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-5 border-t border-white/10 flex gap-3 bg-black/40">
                            <input
                                type="text"
                                placeholder="Ask about ThoongaNagaram features..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-primary-green/50 transition-colors text-white placeholder:text-gray-600"
                            />
                            <button
                                onClick={() => handleSend(inputText)}
                                disabled={!inputText.trim() || isTyping}
                                className="w-12 h-12 rounded-xl bg-primary-green flex items-center justify-center text-black shadow-[0_4px_16px_rgba(0,242,96,0.2)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Disclaimer */}
                        <div className="px-5 pb-3 text-center bg-black/40">
                            <p className="text-[10px] text-gray-600 font-medium">Assistant of ThoongaNagaram AI platform.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
