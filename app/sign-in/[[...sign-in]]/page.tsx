"use client";

import { SignIn } from "@clerk/nextjs";
import Navbar from "@/app/components/Navbar";
import { useTheme } from "@/hooks/ThemeProvider";
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
          <div className="auth-info-banner">
            <div className="auth-info-icon">i</div>
            <p className="auth-info-text">
              Para registrarte, seleccioná una cuenta de mail no registrada.
            </p>
          </div>    

          <SignIn
          forceRedirectUrl="/loading"
          fallbackRedirectUrl="/loading"
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