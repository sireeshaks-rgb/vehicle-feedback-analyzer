import { motion } from "framer-motion";
import { Star, MessageSquare, TrendingDown, AlertTriangle } from "lucide-react";
import { useAnalyticsSummary } from "@/hooks/use-feedback";

interface KPIProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

function KPICard({ title, value, icon, color, subtitle }: KPIProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card p-8 rounded-[2rem] border-white/40 dark:border-white/5 shadow-2xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex justify-between items-start mb-6 w-full relative z-10">
                <div className={`p-4 rounded-2xl shadow-lg ring-1 ring-black/5 ${color} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="text-right">
                    <span className="block text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{title}</span>
                    <span className="text-4xl font-display font-black tracking-tighter text-foreground">{value}</span>
                </div>
            </div>
            {subtitle && (
                <div className="flex items-center gap-2 mt-4 relative z-10 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-muted-foreground/80">{subtitle}</span>
                </div>
            )}
        </motion.div>
    );
}

export function KPICards() {
    const { data } = useAnalyticsSummary();

    const metrics = [
        {
            title: "Avg Rating",
            value: data?.avgRating?.toFixed(1) || "0.0",
            icon: <Star className="w-6 h-6" />,
            color: "bg-amber-500/10 text-amber-600",
            subtitle: "Out of 5.0"
        },
        {
            title: "Total Feedback",
            value: data?.totalFeedback || "0",
            icon: <MessageSquare className="w-6 h-6" />,
            color: "bg-primary/10 text-primary",
            subtitle: "Cumulative"
        },
        {
            title: "Negative %",
            value: "18%", // In a real app, compute this from feedback
            icon: <TrendingDown className="w-6 h-6" />,
            color: "bg-destructive/10 text-destructive",
            subtitle: "↑ 2% vs last week"
        },
        {
            title: "Emerging Issues",
            value: "3",
            icon: <AlertTriangle className="w-6 h-6" />,
            color: "bg-emerald-500/10 text-emerald-600",
            subtitle: "Overcrowding spike"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
            {metrics.map((m, i) => (
                <KPICard key={i} {...m} />
            ))}
        </div>
    );
}
