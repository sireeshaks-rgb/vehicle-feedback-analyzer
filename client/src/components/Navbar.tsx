import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Train, BarChart2, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full glass border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
            <Train className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            TransitSense
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Dashboard
            </span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Admin
                </span>
              </Link>
              <button 
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link href="/admin/auth" className="text-sm font-medium transition-colors text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg">
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
