import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PASSENGER" | "ADMIN">("PASSENGER");
  const [redirecting, setRedirecting] = useState(false);

  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();

  const isPending = login.isPending || register.isPending || redirecting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const action = isLogin ? login : register;
    const payload = isLogin ? { email, password } : { email, password, role };

    action.mutate(payload as any, {
      onSuccess: async () => {
        setRedirecting(true);
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: "Redirecting to your dashboard...",
        });
        // Wait briefly for /api/auth/me to re-fetch, then redirect
        await new Promise(r => setTimeout(r, 600));
        // Determine redirect: try to get the token and decode role
        const token = localStorage.getItem("auth_token");
        if (token) {
          try {
            const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const user = await res.json();
              if (user.role === "ADMIN" || user.role === "ORG_ADMIN" || user.role === "SUPER_ADMIN") {
                setLocation("/admin");
              } else {
                setLocation("/passenger");
              }
              return;
            }
          } catch (_) { }
        }
        setLocation("/");
      },
      onError: (err) => {
        setRedirecting(false);
        toast({
          title: "Authentication Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      {/* landing page hero scenic mountain landscape */}
      <img
        src="https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=1920&h=1080&fit=crop"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none mix-blend-luminosity"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-border/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />

          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Secure access to feedback management</p>
          </div>

          <div className="flex bg-secondary/50 p-1 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-slate-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground px-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="admin@transit.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground px-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground px-1">I am a...</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("PASSENGER")}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${role === "PASSENGER" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${role === "ADMIN" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    Transit Staff
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Access Dashboard' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setLocation("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              ← Back to Public View
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
