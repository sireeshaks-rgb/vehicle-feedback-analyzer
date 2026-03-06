import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, Sparkles, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

interface ChartPoint {
    date: string;
    actual?: number;
    predicted?: number;
    avgRating?: number;
}

const MODES = ["Bus", "Train", "Airplane"] as const;
type Mode = typeof MODES[number];

export function ForecastPanel() {
    const [selectedMode, setSelectedMode] = useState<Mode>("Bus");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ forecast: string; chartData: ChartPoint[] } | null>(null);

    useEffect(() => {
        fetchForecast(selectedMode);
    }, []);

    const fetchForecast = async (mode: Mode) => {
        setSelectedMode(mode);
        setLoading(true);
        try {
            const token = localStorage.getItem("auth_token");
            const res = await fetch("/api/analytics/forecast", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ mode, days: 7 })
            });
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error("Forecast fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    const modeEmoji: Record<Mode, string> = { Bus: "🚌", Train: "🚆", Airplane: "✈️" };

    // Find today's index to add reference line
    const todayIndex = data?.chartData?.findIndex(d => !d.actual && d.predicted !== undefined) ?? -1;
    const todayDate = todayIndex > 0 ? data?.chartData?.[todayIndex - 1]?.date : undefined;

    return (
        <div className="space-y-10">
            {/* Mode selector - Floating pill style */}
            <div className="flex items-center gap-3 p-1.5 glass rounded-[1.8rem] w-fit border-white/40">
                {MODES.map(mode => (
                    <button
                        key={mode}
                        onClick={() => fetchForecast(mode)}
                        className={`relative flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${selectedMode === mode
                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-black/5"
                            : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-foreground"
                            }`}
                    >
                        <span className="text-base">{modeEmoji[mode]}</span>
                        {mode}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            <div className="glass-card rounded-[2.5rem] p-10 border-white/20 shadow-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-32 -translate-x-32" />

                {loading && (
                    <div className="flex flex-col items-center justify-center h-[350px] gap-4">
                        <div className="relative w-16 h-16">
                            <Loader2 className="w-16 h-16 animate-spin text-primary/20" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary/60">Simulating Forecast Models...</p>
                    </div>
                )}

                {!loading && !data && (
                    <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground gap-6">
                        <div className="p-6 rounded-full bg-secondary/50 border border-border">
                            <TrendingUp className="w-10 h-10 opacity-30" />
                        </div>
                        <p className="text-sm font-bold tracking-tight">Select an intelligence stream above to generate 7-day projections.</p>
                    </div>
                )}

                {!loading && data && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="font-display font-black text-2xl tracking-tight mb-1">{modeEmoji[selectedMode]} {selectedMode} Network Drift</h3>
                                <p className="text-sm text-muted-foreground font-medium">14-Day Historical Verification + 7-Day Predicted Volume</p>
                            </div>
                            <div className="flex items-center gap-6 glass px-6 py-3 rounded-2xl border-white/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Verified Hits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-dashed border-white shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Projections</span>
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={data.chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#94A3B8" }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={15}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#94A3B8" }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "20px",
                                        border: "1px solid rgba(255,255,255,0.4)",
                                        background: "rgba(255,255,255,0.9)",
                                        backdropFilter: "blur(12px)",
                                        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)"
                                    }}
                                    itemStyle={{
                                        fontSize: "12px",
                                        fontWeight: "800",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}
                                />
                                {todayDate && (
                                    <ReferenceLine
                                        x={todayDate}
                                        stroke="#6366f1"
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                        label={{
                                            value: "CURRENT NODE",
                                            position: "top",
                                            fontSize: 9,
                                            fontWeight: "900",
                                            fill: "#6366f1",
                                            letterSpacing: "0.2em"
                                        }}
                                    />
                                )}
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#f59e0b"
                                    strokeWidth={4}
                                    strokeDasharray="10 5"
                                    dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>

            {/* AI Causal Narrative - High Fidelity */}
            {data?.forecast && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative glass-card border-primary/20 rounded-[2.5rem] p-10 overflow-hidden shadow-3xl bg-white/90 dark:bg-slate-900/90"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-32 translate-x-32" />
                    <div className="flex items-start gap-8 relative z-10">
                        <div className="shrink-0 w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Causal Matrix</p>
                            </div>
                            <p className="text-base font-bold leading-relaxed text-foreground/90 max-w-4xl">{data.forecast}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
