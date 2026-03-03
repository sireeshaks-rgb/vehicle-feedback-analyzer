import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { PublicDashboard } from "./pages/PublicDashboard";
import { AdminAuth } from "./pages/AdminAuth";
import { AdminDashboard } from "./pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicDashboard} />
      <Route path="/admin/auth" component={AdminAuth} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
