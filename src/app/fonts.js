import localFont from "next/font/local";


export const gambetta = localFont({
  src: [
    {
      path: "../../public/fonts/Gambetta_Complete/Gambetta_Complete/Fonts/WEB/fonts/Gambetta-Variable.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
  variable: "--font-gambetta",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi_Complete/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
