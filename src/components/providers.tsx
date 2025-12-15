"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RealtimeProvider } from "@upstash/realtime/client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RealtimeProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </RealtimeProvider>
    </NextThemesProvider>
  );
};
