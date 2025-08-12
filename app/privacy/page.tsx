import { PrivacySection } from "@/components/ui/privacy";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SkillChain",
  description: "Learn how SkillChain protects and handles your data",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <PrivacySection />
      </main>
      <Footer />
    </>
  );
}
