import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/app/store";

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="ems-ui-theme">
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
