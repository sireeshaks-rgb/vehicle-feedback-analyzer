import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, Info, Copy, CheckCircle, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Mitigation {
    mode: string;
    severity: "CRITICAL" | "WARNING" | "ADVISORY";
    topIssue: string;
    count: number;
    avgRating: number;
    plan: string;
    timestamp: string;
}

const SEVERITY_CONFIG = {
    CRITICAL: {
        bg: "bg-red-500/5 dark:bg-red-500/10 border-red-500/30",
        badge: "bg-red-500 text-white",
        icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
        accent: "bg-red-500",
        glow: "shadow-red-500/10",
    },
    WARNING: {
        bg: "bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/30",
        badge: "bg-orange-500 text-white",
        icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
        accent: "bg-orange-500",
        glow: "shadow-orange-500/10",
    },
    ADVISORY: {
        bg: "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30",
        badge: "bg-blue-500 text-white",
        icon: <Info className="w-6 h-6 text-blue-500" />,
        accent: "bg-blue-500",
        glow: "shadow-blue-500/10",
    },
};

const MODE_EMOJI: Record<string, string> = { Bus: "🚌", Train: "🚆", Airplane: "✈️" };

export function ActionCenter() {
    const [mitigations, setMitigations] = useState<Mitigation[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const { toast } = useToast();

    const fetchMitigations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("auth_token");
            const res = await fetch("/api/analytics/mitigations", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setMitigations(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Mitigations fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMitigations(); }, []);

    const copyPlan = (idx: number, plan: string) => {
        navigator.clipboard.writeText(plan);
        setCopiedId(idx);
        toast({ title: "Copied!", description: "Mitigation plan copied to clipboard." });
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between glass p-6 rounded-[2rem] border-white/40">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-black tracking-tight">AI Command Center</h3>
                        <p className="text-sm text-muted-foreground font-medium italic">Operational triggers drafted from real-time intelligence feeds.</p>
                    </div>
                </div>
                <button
                    onClick={fetchMitigations}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border/50 text-xs font-black uppercase tracking-widest hover:border-primary/40 transition-all hover:shadow-xl active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Sync Intelligence
                </button>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-primary/20" />
                        <ShieldAlert className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary opacity-40" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">Scanning Risk Patterns...</p>
                </div>
            )}

            {!loading && mitigations.length === 0 && (
                <div className="py-24 glass-card rounded-[3rem] text-center border-dashed border-2 border-border">
                    <div className="p-8 bg-secondary/30 rounded-full w-fit mx-auto mb-6">
                        <ShieldAlert className="w-16 h-16 opacity-10" />
                    </div>
                    <p className="text-xl font-display font-black tracking-tight text-muted-foreground/60 mb-2">Zero Critical Deviations Detected</p>
                    <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">Network status: STABLE. No proactive mitigations required at this timestamp.</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence>
                    {!loading && mitigations.map((m, i) => {
                        const config = SEVERITY_CONFIG[m.severity];
                        return (
                            <motion.div
                                key={`${m.mode}-${i}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative rounded-[2.5rem] border-2 glass-card p-10 overflow-hidden shadow-2xl ${config.bg} ${config.glow}`}
                            >
                                <div className={`absolute top-0 left-0 w-2 h-full ${config.accent}`} />
                                <div className={`absolute top-1/2 left-0 w-64 h-64 ${config.accent}/10 rounded-full blur-[80px] -translate-x-32 -translate-y-1/2`} />

                                {/* Header */}
                                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10 relative z-10">
                                    <div className="flex items-start gap-6">
                                        <div className={`shrink-0 w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 flex items-center justify-center`}>
                                            {config.icon}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{MODE_EMOJI[m.mode]}</span>
                                                <h4 className="text-3xl font-display font-black tracking-tight">{m.mode} Fleet Delta</h4>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${config.badge}`}>
                                                    {m.severity}
                                                </span>
                                            </div>
                                            <p className="text-base text-muted-foreground font-medium">
                                                Detected anomaly: <span className="text-foreground font-black underline decoration-primary/30 underline-offset-4">{m.topIssue}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right glass px-4 py-2 rounded-xl border-white/40">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Incident Window</p>
                                        <p className="text-sm font-black text-foreground">{new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
                                    </div>
                                </div>

                                {/* Metrics Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
                                    <div className="glass px-6 py-4 rounded-2xl border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Volume</p>
                                        <p className="text-xl font-display font-black">{m.count} reports</p>
                                    </div>
                                    <div className="glass px-6 py-4 rounded-2xl border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Avg Sentiment</p>
                                        <p className="text-xl font-display font-black">{m.avgRating}/5.0</p>
                                    </div>
                                </div>

                                {/* AI Mitigation High Fidelity */}
                                <div className="relative group relative overflow-hidden bg-white/50 dark:bg-black/40 rounded-[2rem] p-8 border border-white/40 shadow-inner z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-1.5 bg-primary/10 rounded-lg"><Sparkles className="w-4 h-4 text-primary animate-pulse" /></div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Response Directive</p>
                                    </div>
                                    <p className="text-base font-bold leading-relaxed text-foreground/90 italic">"{m.plan}"</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 mt-10 relative z-10">
                                    <button
                                        onClick={() => copyPlan(i, m.plan)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-border/50 text-xs font-black uppercase tracking-[0.2em] hover:border-primary/40 transition-all hover:shadow-2xl active:scale-95"
                                    >
                                        {copiedId === i ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
                                        {copiedId === i ? "Buffered" : "Copy Directive"}
                                    </button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_15px_35px_-5px_rgba(99,102,241,0.5)] transition-all active:scale-95">
                                        Execute Action
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
