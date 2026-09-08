import "lenis/dist/lenis.css";
import "./globals.css";
import { gambetta, satoshi } from "./fonts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "L’Ombre is a Paris-based advertising and creative studio working across brand, film and digital experience.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "L’Ombre — Advertising & Creative Studio",
    template: "%s · L’Ombre",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "L’Ombre",
    title: "L’Ombre — Advertising & Creative Studio",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "L’Ombre — Advertising & Creative Studio",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${gambetta.variable} ${satoshi.variable} h-full`}
    >
      <head>

        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ".stage{height:100svh}.stage__frame{position:relative}" +
                ".curtain{display:none}.plate__slogan{display:none}" +
                ".plate__mark{clip-path:inset(-20% 0% -20% 0%)}" +
                ".pj__stage,.pj__aside,.controls{opacity:1}" +
                "[data-reveal]{clip-path:none}" +
                "[data-rise],[data-in]{opacity:1}" +
                "[data-mask] [data-line]{transform:none}" +
                "[data-shutter] [data-line],[data-wipe]{clip-path:none}",
            }}
          />
        </noscript>
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
