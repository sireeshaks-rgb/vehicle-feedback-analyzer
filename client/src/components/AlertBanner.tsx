import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAnalyticsSummary } from "@/hooks/use-feedback";

export function AlertBanner() {
    const { data } = useAnalyticsSummary();
    const [closed, setClosed] = useState<string[]>([]);

    if (!data?.alerts || data.alerts.length === 0) return null;

    const activeAlerts = data.alerts.filter((a: any) => !closed.includes(a.message));

    return (
        <div className="w-full max-w-4xl space-y-3 mb-8">
            <AnimatePresence>
                {activeAlerts.map((alert: any, i: number) => (
                    <motion.div
                        key={alert.message}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${alert.type === "CRITICAL"
                                ? "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                                : alert.type === "WARNING"
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-100"
                            }`}
                    >
                        <div className="shrink-0">
                            {alert.type === "CRITICAL" ? <AlertCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-sm uppercase tracking-wider">{alert.type} ALERT</span>
                                <span className="text-xs opacity-60">• Impact: {alert.impact}</span>
                            </div>
                            <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                        <button
                            onClick={() => setClosed([...closed, alert.message])}
                            className="p-1 hover:bg-black/5 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
