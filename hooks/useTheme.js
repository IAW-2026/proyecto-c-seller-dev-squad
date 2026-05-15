import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("dark"); 

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const preferred = saved || 
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    
    setTheme(preferred);
    document.documentElement.setAttribute("data-theme", preferred);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return { theme, toggleTheme };
}