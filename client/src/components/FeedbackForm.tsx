import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, Bus, Train, Plane, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function FeedbackForm() {
    const { toast } = useToast();
    const { mutate: submit, isPending } = useSubmitFeedback();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const form = useForm({
        resolver: zodResolver(insertFeedbackSchema),
        defaultValues: {
            transportMode: "Bus" as "Bus" | "Train" | "Airplane",
            reviewText: "",
            rating: 0,
            organizationId: "00000000-0000-0000-0000-000000000000"
        }
    });

    const selectedMode = form.watch("transportMode");

    const modeAssets = {
        Bus: { icon: <Bus className="w-5 h-5" />, label: "Bus", img: "/assets/bus.png" },
        Train: { icon: <Train className="w-5 h-5" />, label: "Train", img: "/assets/train.png" },
        Airplane: { icon: <Plane className="w-5 h-5" />, label: "Plane", img: "/assets/plane.png" },
    };

    const onSubmit = (data: any) => {
        if (rating === 0) {
            toast({ title: "System Signal Required", description: "Please provide a rating metric before broadcasting.", variant: "destructive" });
            return;
        }
        submit({ ...data, rating }, {
            onSuccess: () => {
                toast({ title: "Broadcast Successful", description: "Your intelligence has been synchronized with the network." });
                form.reset();
                setRating(0);
            },
            onError: (err) => {
                toast({ title: "Signal Lost", description: err.message, variant: "destructive" });
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-5xl mx-auto glass-card p-1 pb-1 rounded-[3.5rem] border-white/20 shadow-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl overflow-hidden relative"
        >
            <div className="flex flex-col lg:flex-row">
                {/* Visual Preview Side */}
                <div className="lg:w-2/5 relative min-h-[400px] lg:min-h-full p-12 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50" />
                    <div className="absolute inset-0 bg-mesh opacity-30" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedMode}
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 1.2, opacity: 0, rotate: 10 }}
                            className="relative z-10 w-64 h-64 drop-shadow-[0_25px_45px_rgba(0,0,0,0.15)] animate-float"
                        >
                            <img src={modeAssets[selectedMode].img} alt={selectedMode} className="w-full h-full object-contain" />
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative z-10 mt-12 text-center">
                        <h3 className="text-3xl font-display font-black tracking-tighter mb-2">{selectedMode} Module</h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-60">Feedback Matrix Alpha-1</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="lg:w-3/5 p-12 lg:border-l border-white/10 dark:bg-black/20">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        {/* Mode Selector - Premium Icons */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Service Protocol</Label>
                            <div className="grid grid-cols-3 gap-4">
                                {(["Bus", "Train", "Airplane"] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => form.setValue("transportMode", m)}
                                        className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-500 ${selectedMode === m
                                            ? "bg-white dark:bg-slate-800 border-primary shadow-2xl shadow-primary/10 scale-[1.05]"
                                            : "bg-secondary/20 border-transparent text-muted-foreground hover:bg-secondary/40 grayscale hover:grayscale-0"
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${selectedMode === m ? "bg-primary text-white" : "bg-white/50 dark:bg-slate-900/50"}`}>
                                            {modeAssets[m].icon}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">{m}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating - Large Stars */}
                        <div className="space-y-4 text-center">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Satisfaction Metric</Label>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(s)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(s)}
                                        className={`p-2 transition-all transform hover:scale-125 active:scale-95 ${(hoverRating || rating) >= s ? "text-amber-500" : "text-muted-foreground/20"}`}
                                    >
                                        <Star className={`w-12 h-12 ${(hoverRating || rating) >= s ? "fill-current" : ""}`} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                                {rating > 0 ? ["UNSATISFACTORY", "BELOW PAR", "STANDARD", "EXCELLENT", "OPTIMUM SERVICE"][rating - 1] : "AWAITING SELECTION"}
                            </p>
                        </div>

                        {/* Textarea - Glass style */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Narrative Input</Label>
                            <div className="relative group">
                                <Textarea
                                    {...form.register("reviewText")}
                                    placeholder="Briefly describe your transit experience..."
                                    className="rounded-[2rem] border-2 border-border/50 bg-secondary/10 min-h-[160px] p-6 text-lg focus:ring-0 focus:border-primary/50 transition-all resize-none placeholder:text-muted-foreground/30 font-medium"
                                />
                                <div className="absolute bottom-6 right-6 p-2 bg-primary/10 rounded-xl">
                                    <Sparkles className="w-4 h-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 bg-gradient-to-r from-primary to-accent"
                        >
                            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Broadcast Intelligence"}
                        </Button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
