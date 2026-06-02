"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider, useTheme } from "@/hooks/ThemeProvider";

function ClerkWithTheme({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export default function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClerkWithTheme>{children}</ClerkWithTheme>
    </ThemeProvider>
  );
}