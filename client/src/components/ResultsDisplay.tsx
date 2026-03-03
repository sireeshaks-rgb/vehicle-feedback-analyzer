import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, MessageSquareText, TrendingUp } from "lucide-react";
import { SentimentChart } from "./SentimentChart";
import type { QueryResponse } from "@shared/schema";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function ResultsDisplay({ data }: { data: QueryResponse }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
    >
      {/* Main Summary Panel */}
      <motion.div variants={item} className="lg:col-span-2 space-y-6">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold">Executive Summary</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Recommendations */}
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold">Actionable Recommendations</h2>
          </div>
          <div className="space-y-4">
            {data.recommendations.map((rec, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 5 }}
                className="flex gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-primary shadow-sm">
                  {i + 1}
                </div>
                <p className="text-foreground">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Side Panel */}
      <motion.div variants={item} className="space-y-6">
        {/* Sentiment Overview */}
        <div className="glass-card p-6 rounded-3xl flex flex-col items-center">
          <div className="flex items-center gap-2 self-start mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-display font-bold">Sentiment Overview</h3>
          </div>
          <SentimentChart data={data.sentiment_distribution} />
        </div>

        {/* Top Issues */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="text-xl font-display font-bold">Top Pain Points</h3>
          </div>
          <div className="space-y-3">
            {data.top_issues.map((issue, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive-foreground/80 font-medium flex items-start gap-3"
              >
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                <span className="text-foreground">{issue}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
