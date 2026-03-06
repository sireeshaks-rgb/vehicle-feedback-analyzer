import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuth } from "@/pages/AdminAuth";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminView } from "@/pages/AdminView";
import { PublicDashboard } from "@/pages/PublicDashboard";
import NotFound from "@/pages/not-found";

import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/auth");
      } else if (user.role === "ADMIN" || user.role === "ORG_ADMIN") {
        setLocation("/admin");
      } else {
        setLocation("/passenger");
      }
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );
}


function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType, roles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    } else if (!isLoading && user && roles && !roles.includes(user.role)) {
      setLocation("/");
    }
  }, [user, isLoading, roles, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return user ? <Component /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AdminAuth} />
      <Route path="/passenger">
        <ProtectedRoute component={PublicDashboard} roles={["PASSENGER", "ADMIN", "ORG_ADMIN", "VIEWER"]} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminView} roles={["ADMIN", "ORG_ADMIN", "SUPER_ADMIN"]} />
      </Route>
      <Route path="/admin/manage">
        <ProtectedRoute component={AdminDashboard} roles={["ADMIN", "ORG_ADMIN", "SUPER_ADMIN"]} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

import { Navbar } from "@/components/Navbar";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Navbar />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
