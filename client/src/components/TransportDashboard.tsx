import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransportAnalytics } from "@/hooks/use-feedback";
import { Star, MessageSquare, TrendingDown, AlertTriangle, Bus, Train, Plane, Loader2, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#fbbf24", "#84cc16", "#22c55e"];

interface MetricProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    label: string;
}

function MetricCard({ title, value, icon, color, label }: MetricProps) {
    return (
        <div className="glass-card p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden group/card hover:scale-[1.02] transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover/card:opacity-[0.08] transition-opacity`} />
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 shadow-xl ring-1 ring-black/5`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
                    <p className="text-sm font-bold text-foreground/80">{label}</p>
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-display font-black tracking-tighter">{value}</span>
            </div>
        </div>
    );
}

export function TransportDashboard() {
    const [mode, setMode] = useState<"Bus" | "Train" | "Airplane">("Bus");
    const { data, isLoading } = useTransportAnalytics(mode);

    const modes = [
        { id: "Bus", icon: <Bus className="w-5 h-5" />, label: "Bus Fleet" },
        { id: "Train", icon: <Train className="w-5 h-5" />, label: "Rail Network" },
        { id: "Airplane", icon: <Plane className="w-5 h-5" />, label: "Air Corridor" },
    ];

    return (
        <div className="w-full space-y-12">
            {/* Mode Navigator */}
            <div className="flex items-center gap-3 p-2 glass rounded-[2.5rem] w-fit mx-auto border-white/40 shadow-2xl">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        className={`group relative flex items-center gap-3 px-10 py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 ${mode === m.id
                            ? "bg-white dark:bg-slate-800 text-primary shadow-xl ring-1 ring-black/5 scale-[1.05]"
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                            }`}
                    >
                        <span className={`transition-transform duration-500 ${mode === m.id ? "scale-110" : "group-hover:scale-110"}`}>{m.icon}</span>
                        {m.label}
                        {mode === m.id && (
                            <motion.div layoutId="modeGlow" className="absolute inset-0 rounded-[1.8rem] ring-2 ring-primary/20 blur-md" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-32 gap-6"
                    >
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-primary/20" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">Synchronizing Network Stats...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-12"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <MetricCard
                                title="System Fidelity"
                                value={data?.avgRating?.toFixed(1) || "0.0"}
                                label="Avg Rating"
                                icon={<Star className="w-6 h-6" />}
                                color="text-amber-500"
                            />
                            <MetricCard
                                title="Signal Volume"
                                value={data?.totalFeedback || "0"}
                                label="Total Feedback"
                                icon={<MessageSquare className="w-6 h-6" />}
                                color="text-primary"
                            />
                            <MetricCard
                                title="Critical Index"
                                value={`${data?.negativePercent?.toFixed(0) || 0}%`}
                                label="Negative Ratio"
                                icon={<TrendingDown className="w-6 h-6" />}
                                color="text-red-500"
                            />
                            <MetricCard
                                title="Anomaly Count"
                                value={data?.emergingIssues?.length || "0"}
                                label="Detected Issues"
                                icon={<AlertTriangle className="w-6 h-6" />}
                                color="text-emerald-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                            <div className="lg:col-span-3 glass-card p-10 rounded-[3rem] border-white/20 shadow-3xl bg-white/80 dark:bg-slate-900/80">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-2xl font-display font-black tracking-tight mb-1">Sentiment Gradient</h3>
                                        <p className="text-sm text-muted-foreground font-medium">Distribution of passenger engagement levels.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(v => (
                                            <div key={v} className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[v - 1] }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.distribution || []} margin={{ left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                                            <XAxis
                                                dataKey="rating"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: "900" }}
                                                dy={10}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: "900" }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 16 }}
                                                contentStyle={{
                                                    borderRadius: '20px',
                                                    border: '1px solid rgba(255,255,255,0.4)',
                                                    background: 'rgba(255,255,255,0.9)',
                                                    backdropFilter: "blur(12px)",
                                                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={40}>
                                                {data?.distribution?.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/20 shadow-3xl bg-white/80 dark:bg-slate-900/80 flex flex-col">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-display font-black tracking-tight mb-1">Core Intelligence</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Key insights extracted from the {mode} network.</p>
                                </div>
                                <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {data?.emergingIssues?.length > 0 ? (
                                        data.emergingIssues.map((issue: string, i: number) => (
                                            <motion.div
                                                key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                className="group/issue flex items-center gap-6 p-6 rounded-[2rem] glass border-white/20 hover:border-primary/50 transition-all cursor-default"
                                            >
                                                <div className="w-1.5 h-12 bg-gradient-to-b from-primary to-accent rounded-full transition-all group-hover/issue:h-16" />
                                                <div>
                                                    <p className="text-lg font-black text-foreground/90 leading-tight mb-1">{issue}</p>
                                                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Sentiment Anomaly</p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="p-6 bg-emerald-500/10 rounded-full mb-6 text-emerald-500 shadow-2xl shadow-emerald-500/20">
                                                <Sparkles className="w-10 h-10" />
                                            </div>
                                            <p className="text-xl font-display font-black text-foreground/40 italic">Optimum Service detected. No anomalies reported.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 pt-10 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Network Focus Directives</p>
                                    <div className="flex flex-wrap gap-3">
                                        {(mode === "Bus" ? ["Crowding", "Delay Management", "Route Optimization"] :
                                            mode === "Train" ? ["Punctuality", "Cleanliness", "Platform Safety"] :
                                                ["Boarding Flow", "Seat Comfort", "Cabin Crew"]).map(v => (
                                                    <span key={v} className="px-5 py-2.5 rounded-full glass border-white/40 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-white hover:text-primary transition-all cursor-default">{v}</span>
                                                ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
