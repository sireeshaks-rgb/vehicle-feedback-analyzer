import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { useRagQuery } from "@/hooks/use-rag";
import { useToast } from "@/hooks/use-toast";

export function PublicDashboard() {
  const [query, setQuery] = useState("");
  const { mutate: executeQuery, isPending, data } = useRagQuery();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    executeQuery({ question: query }, {
      onError: (err) => {
        toast({
          title: "Analysis Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" /> AI-Powered Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground leading-tight mb-6">
            Understand your passengers in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">seconds</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Ask any question about passenger feedback, delays, or service quality and get instant, actionable insights.
          </p>
        </motion.div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="w-full max-w-3xl mb-16 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl transition-all duration-500 group-hover:opacity-100 opacity-50" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-border/50 rounded-3xl shadow-xl p-2 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
            <div className="pl-4 text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What are the main complaints about weekend train services?"
              className="w-full bg-transparent border-none outline-none px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground/60"
            />
            <button 
              type="submit"
              disabled={isPending || !query.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Analyze"}
            </button>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {data && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="w-full"
            >
              <ResultsDisplay data={data} />
            </motion.div>
          )}
        </AnimatePresence>

        {!data && !isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl opacity-60"
          >
            {[
              "How is the cleanliness on the Northern line?",
              "Summarize feedback regarding ticket pricing.",
              "What do passengers love about the new app?"
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setQuery(suggestion)}
                className="text-left p-4 rounded-2xl border border-border/50 hover:bg-secondary/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                "{suggestion}"
              </button>
            ))}
          </motion.div>
        )}

      </main>
    </div>
  );
}
