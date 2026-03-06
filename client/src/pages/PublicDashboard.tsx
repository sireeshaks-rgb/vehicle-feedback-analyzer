import { motion } from "framer-motion";
import { Sparkles, FileDown } from "lucide-react";
import { KPICards } from "@/components/KPICards";
import { CohortAnalysis } from "@/components/CohortAnalysis";
import { AlertBanner } from "@/components/AlertBanner";
import { FeedbackForm } from "@/components/FeedbackForm";

export function PublicDashboard() {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-slate-950 pb-32">
      {/* Premium Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-mesh opacity-40 dark:opacity-60 pointer-events-none" />

        {/* Floating 3D Background Assets */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-64 h-64 grayscale opacity-20 dark:opacity-30 blur-sm mix-blend-overlay rotate-12 pointer-events-none"
        >
          <img src="/assets/train.png" alt="3D Train" className="w-full h-full object-contain" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-[15%] w-80 h-80 grayscale opacity-20 dark:opacity-30 blur-sm mix-blend-overlay -rotate-6 pointer-events-none"
        >
          <img src="/assets/plane.png" alt="3D Plane" className="w-full h-full object-contain" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Pulse Transport Network</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-9xl font-display font-black tracking-tighter mb-8 leading-[0.9]"
          >
            Shaping the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500">Citizen Journey</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Your voice is the heartbeat of our infrastructure. Real-time feedback, powered by AI, to build a more connected tomorrow.
          </motion.p>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center z-10 relative">

        <div className="w-full flex justify-between items-start mb-12">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-foreground leading-tight mb-4">
              Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Hub</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore public transport intelligence via AI-driven analytics.
            </p>
          </motion.div>

          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={handleExport}
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold text-sm print:hidden"
          >
            <FileDown className="w-4 h-4" /> Export Report (PDF)
          </motion.button>
        </div>

        <AlertBanner />
        <KPICards />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-12"
        >
          <CohortAnalysis />
        </motion.div>

        <section className="w-full mt-32 relative">
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="text-center mb-16">
            <h2 className="text-5xl font-display font-black tracking-tight mb-4 text-slate-900 dark:text-white">Broadcast Your Voice</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Instant intelligence capture for transit authorities. Select your mode below to review.</p>
          </div>
          <FeedbackForm />
        </section>

      </main>
    </div>
  );
}
