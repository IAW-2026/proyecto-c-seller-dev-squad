"use client";

import { SignIn } from "@clerk/nextjs";
import Navbar from "@/app/components/Navbar";
import { useTheme } from "@/hooks/useTheme";
import { dark } from "@clerk/themes";


export default function SignInPage() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }
  return (
    <>
       <Navbar />

      <div className="auth-page">
        <div className="auth-card">
           <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-white/5 px-4 py-4 backdrop-blur-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-400">
              i
            </div>

            <p className="text-sm font-medium text-zinc-200">
              Para registrarte, seleccioná una cuenta de mail no registrada.
            </p>

          </div>
          <SignIn
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
            appearance={{
              baseTheme:
                theme === "dark"
                  ? dark
                  : undefined,

              elements: {
                logoBox: {display: "none",},
                  footerAction: {display: "none", },
              },
            }}
          />
        </div>
      </div>
    </>
  );
}