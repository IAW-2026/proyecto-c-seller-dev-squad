"use client";

import { SignIn } from "@clerk/nextjs";
import Navbar from "@/app/components/Navbar";
import { useTheme } from "@/hooks/useTheme";
import { dark } from "@clerk/themes";


export default function SignInPage() {
  const { theme } = useTheme();

  return (
    <>
       <Navbar />

      <div className="auth-page">
        <div className="auth-card">
          <SignIn
            key={theme}
            appearance={{
              baseTheme:
                theme === "dark"
                  ? dark
                  : undefined,

              elements: {
                headerTitle: {
                  display: "none",
                },

                headerSubtitle: {
                  display: "none",
                },

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