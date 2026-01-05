"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Stethoscope, Activity, Rocket, Paperclip, X, LogOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Ensure you run: npm install remark-gfm
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import AuthForm from "./AuthForm";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Message = {
    role: "user" | "model";
    content: string;
    image?: string;
};

function ChatApp() {
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAntiGravity, setIsAntiGravity] = useState(false);
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, attachedImage, isLoading]);

    // Load Chat History
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            const sessionId = session.user.email;
            fetch(`/api/chat/history?sessionId=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.messages) setMessages(data.messages);
                })
                .catch(err => console.error("History error:", err));
        }
    }, [status, session]);

    if (status === "loading") {
        return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;
    }

    if (status === "unauthenticated") return <AuthForm />;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setAttachedImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !attachedImage) || isLoading) return;

        // Abort previous request if still running
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        const userMessage: Message = { 
            role: "user", 
            content: input,
            image: attachedImage || undefined
        };
        
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setAttachedImage(null);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({ 
                    messages: [...messages, userMessage],
                    isAntiGravity,
                    sessionId: session?.user?.email 
                }),
            });

            if (!response.ok) throw new Error("Server error");
            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // Placeholder for AI response
            setMessages((prev) => [...prev, { role: "model", content: "" }]);

            let accumulatedText = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;

                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = accumulatedText;
                    return updated;
                });
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setMessages((prev) => [...prev, { role: "model", content: "⚠️ Connection error. Please try again." }]);
            }
        } finally {
            setIsLoading(false);
        }  
    };

    return (
        <div className={cn("flex flex-col h-screen transition-colors duration-700", isAntiGravity ? "bg-slate-950" : "bg-slate-50")}>
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg text-white shadow-lg transition-all duration-500", isAntiGravity ? "bg-purple-600 rotate-12" : "bg-teal-600")}>
                        <Stethoscope size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">AIMed Guru</h1>
                        <p className={cn("text-xs font-medium uppercase flex items-center gap-1", isAntiGravity ? "text-purple-600" : "text-teal-600")}>
                            <Activity size={12} /> {isAntiGravity ? "Zero-G Mode" : "Medical Mentor"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <button
                        onClick={() => setIsAntiGravity(!isAntiGravity)}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border", 
                            isAntiGravity ? "bg-purple-600 text-white border-purple-400" : "bg-slate-100 text-slate-600 border-slate-200")}
                     >
                        <Rocket size={14} className={cn("transition-transform", isAntiGravity && "-rotate-45")} />
                        <span className="hidden sm:inline">ANTI-GRAVITY</span>
                     </button>
                     <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 container mx-auto max-w-4xl">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className={cn("p-8 rounded-full mb-6 transition-all duration-1000", isAntiGravity ? "bg-purple-500/10 animate-pulse" : "bg-teal-500/10")}>
                            {isAntiGravity ? <Rocket size={64} className="text-purple-500" /> : <Stethoscope size={64} className="text-teal-600" />}
                        </div>
                        <h2 className={cn("text-3xl font-bold mb-2", isAntiGravity ? "text-white" : "text-slate-800")}>Mission Control Ready</h2>
                        <p className="text-slate-500 max-w-sm">Ask about Human Physiology, Organic Chemistry, or Kinematics.</p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={i} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border", m.role === "user" ? "bg-slate-800 text-white" : (isAntiGravity ? "bg-purple-600 text-white" : "bg-teal-600 text-white"))}>
                                {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div className={cn("max-w-[85%] rounded-2xl px-5 py-3 shadow-sm", m.role === "user" ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-800")}>
                                {m.image && <img src={m.image} alt="Upload" className="rounded-lg mb-3 max-w-full h-auto border border-slate-100" />}
                                <div className="prose prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-slate-200" />
                        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-slate-400 text-sm">Analyzing data...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Footer */}
            <footer className={cn("p-4 border-t sticky bottom-0", isAntiGravity ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                <div className="container mx-auto max-w-4xl">
                    {attachedImage && (
                        <div className="mb-3 relative inline-block group">
                            <img src={attachedImage} className="w-24 h-24 object-cover rounded-xl border-2 border-teal-500 shadow-lg" />
                            <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-teal-600 transition-colors"><Paperclip size={22} /></button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isAntiGravity ? "Ask in zero-G..." : "Type your medical query..."}
                            className={cn("w-full py-4 px-6 rounded-2xl border transition-all outline-none", 
                                isAntiGravity ? "bg-slate-800 border-slate-700 text-white focus:border-purple-500" : "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-teal-500/20")}
                        />
                        <button disabled={isLoading} type="submit" className={cn("absolute right-2 p-3 rounded-xl text-white transition-transform active:scale-95", isAntiGravity ? "bg-purple-600" : "bg-teal-600")}>
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}

export default function ChatInterface() {
    return <SessionProvider><ChatApp /></SessionProvider>;
}