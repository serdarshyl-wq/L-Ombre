import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Colophon from "@/components/Colophon";
import { ORG, SITE_ID } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DESCRIPTION =
  "L’Ombre is a Paris-based advertising and creative studio working across brand, film and digital experience.";


const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      ...ORG,
      alternateName: ["L'Ombre", "LOmbre"],
      url: SITE_URL,
      description: DESCRIPTION,
      slogan: "L’Émotion Pure · La Passion Brute · L’Art Éternel",
    },
    {
      "@type": "WebSite",
      "@id": SITE_ID,
      name: "L’Ombre",
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": ORG["@id"] },
    },
  ],
};

export default function SiteLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmoothScroll>
        <Navbar />
        {children}
        <Footer />
        <Colophon />
      </SmoothScroll>
    </>
  );
}
