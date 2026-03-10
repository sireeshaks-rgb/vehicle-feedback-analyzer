import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, MessageSquare, Star, Brain, Map, TrendingUp, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { KPICards } from "@/components/KPICards";
import { useFeedbackList, useAnalyzeSingle } from "@/hooks/use-feedback";
import { HeatMap } from "@/components/HeatMap";
import { ForecastPanel } from "@/components/ForecastPanel";
import { ActionCenter } from "@/components/ActionCenter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { useRef } from "react";



export function AdminView() {
    const { data: feedbackList, isLoading: isListLoading } = useFeedbackList();
    const { mutate: analyzeSingle, isPending: isAnalyzePending } = useAnalyzeSingle();
    const { toast } = useToast();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [analyses, setAnalyses] = useState<Record<string, string>>({});
    const dashboardRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current) return;

        toast({ title: "Generating PDF", description: "Please wait while we prepare your report..." });

        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: window.getComputedStyle(document.body).backgroundColor
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`TransitSense-Intelligence-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);

            toast({ title: "Success", description: "Report downloaded successfully!" });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast({ title: "Export failed", description: "Could not generate PDF report.", variant: "destructive" });
        }
    };

    const handleAnalyzeSingle = (id: string) => {
        analyzeSingle(id, {
            onSuccess: (res) => {
                setAnalyses(prev => ({ ...prev, [id]: res.analysis }));
                setExpandedId(id);
            },
            onError: (err) => {
                toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="min-h-screen bg-mesh flex flex-col relative overflow-hidden">
            {/* Background floating elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply" />
            <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -translate-x-1/2 mix-blend-multiply" />


            <main ref={dashboardRef} className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-12 relative z-10">
                {/* Hero Header */}
                <header className="glass-card rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-l border-white/60 dark:border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20 backdrop-blur-md">
                            <Sparkles className="w-4 h-4" /> Global Control Center
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight leading-tight mb-4">
                            Admin <span className="text-gradient">Intelligence</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                            AI-powered analytics, predictive causal forecasting, and automated proactive operations.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <Button
                            onClick={handleDownloadPDF}
                            variant="outline"
                            className="rounded-2xl h-14 px-8 font-bold text-lg gap-3 border-primary/20 hover:bg-primary/5 transition-all shadow-xl"
                        >
                            <Download className="w-5 h-5" /> Download Report
                        </Button>
                    </div>


                </header>

                {/* KPI Summary */}
                <KPICards />

                {/* Geospatial Hotspot Map */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><Map className="w-5 h-5 text-primary" /></div>
                        <div>
                            <h2 className="text-2xl font-bold">Geospatial Hotspot Map</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">AI extracts locations from feedback text and generates narratives for each hotspot.</p>
                        </div>
                    </div>
                    <HeatMap />
                </section>

                {/* Causal Forecast */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><TrendingUp className="w-5 h-5 text-primary" /></div>
                        <div>
                            <h2 className="text-2xl font-bold">Causal Forecast</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Select a mode to see historical data, AI-predicted trends, and causal links to external events.</p>
                        </div>
                    </div>
                    <ForecastPanel />
                </section>

                {/* Action Center */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><ShieldAlert className="w-5 h-5 text-primary" /></div>
                        <div>
                            <h2 className="text-2xl font-bold">Action Center</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Proactive AI-drafted mitigation plans ordered by severity for the last 48 hours of feedback.</p>
                        </div>
                    </div>
                    <ActionCenter />
                </section>

                {/* Latest Passenger Feedback */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl"><MessageSquare className="w-6 h-6 text-primary" /></div>
                        <div>
                            <h2 className="text-2xl font-bold">Latest Passenger Feedback</h2>
                            <p className="text-sm text-muted-foreground font-medium">Real-time reports across all transport networks.</p>
                        </div>
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-primary/5 border-b border-primary/10">
                                    <tr>
                                        <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground/80">Transport</th>
                                        <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground/80">Rating</th>
                                        <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground/80">Feedback</th>
                                        <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground/80">Date</th>
                                        <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-muted-foreground/80 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    <AnimatePresence>
                                        {feedbackList?.map((fb: any) => (
                                            <React.Fragment key={fb.id}>
                                                <motion.tr
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    className="hover:bg-primary/5 transition-colors group/row"
                                                >
                                                    <td className="px-8 py-5">
                                                        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{fb.transportMode}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex text-amber-500 gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "fill-current" : "opacity-20"}`} />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 max-w-md truncate text-sm font-medium text-foreground/80">{fb.reviewText}</td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                        {fb.createdAt ? format(new Date(fb.createdAt), "MMM d, HH:mm") : "N/A"}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleAnalyzeSingle(fb.id)}
                                                            disabled={isAnalyzePending}
                                                            className="rounded-xl hover:bg-primary/10 group-hover/row:bg-primary hover:text-white transition-all gap-2 font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            <Brain className="w-4 h-4" /> GenAI Analyze
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                                {analyses[fb.id] && expandedId === fb.id && (
                                                    <tr className="bg-gradient-to-r from-primary/5 to-transparent">
                                                        <td colSpan={5} className="px-12 py-10">
                                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex gap-8 items-start relative">
                                                                <div className="absolute left-[-1.5rem] top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                                                                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20">
                                                                    <Brain className="w-8 h-8 text-white" />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Recommendation</p>
                                                                    </div>
                                                                    <p className="text-xl font-bold leading-relaxed text-foreground/90 max-w-3xl">{analyses[fb.id]}</p>
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {isListLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary/30" /></div>}
                            {feedbackList?.length === 0 && !isListLoading && (
                                <div className="text-center py-20 text-muted-foreground">No feedback records yet. Ask passengers to submit some!</div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
