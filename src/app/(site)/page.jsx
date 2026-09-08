import IntroStage from "@/components/IntroStage";
import Selection from "@/components/Selection";
import Expertise from "@/components/Expertise";
import Clientele from "@/components/Clientele";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <IntroStage />
      <Selection />
      <Expertise />
      <Clientele />
      <Contact />
    </main>
  );
}
