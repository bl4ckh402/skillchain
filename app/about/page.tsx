import { Footer } from "@/components/footer";
import { AboutSection } from "@/components/about-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | SkillChain",
  description:
    "Learn about SkillChain's mission to revolutionize blockchain education through interactive learning and earn-to-learn incentives.",
};

export default function AboutPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
