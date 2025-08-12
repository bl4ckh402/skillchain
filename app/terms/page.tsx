import { TermsSection } from "@/components/ui/terms";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SkillChain",
  description: "SkillChain's terms of service and platform guidelines",
};

export default function TermsPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <TermsSection />
      </main>
      <Footer />
    </>
  );
}
