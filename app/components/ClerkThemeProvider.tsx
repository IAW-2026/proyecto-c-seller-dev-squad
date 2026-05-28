"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/hooks/useTheme";

export default function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
const { theme, toggleTheme, mounted } = useTheme();

if (!mounted) {
  return null;
}
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