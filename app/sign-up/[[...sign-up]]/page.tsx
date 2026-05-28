"use client";

import { SignUp } from "@clerk/nextjs";
import Navbar from "@/app/components/Navbar";
import { useTheme } from "@/hooks/useTheme";
import { dark } from "@clerk/themes";


export default function SignUpPage() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }
  return (
    <>
      <Navbar />

      <div className="auth-page">
        <div className="auth-card">
          <SignUp
            fallbackRedirectUrl="/onboarding"
            forceRedirectUrl="/onboarding"
            appearance={{
              baseTheme:
                theme === "dark"
                  ? dark
                  : undefined,

              elements: {
                logoBox: {
                  display: "none",
                },
              },
            }}
          />
        </div>
      </div>
    </>
  );
}