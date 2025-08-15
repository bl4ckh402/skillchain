import { CareersSection } from "@/components/ui/careers";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | SkillChain",
  description:
    "Join the SkillChain team and help shape the future of blockchain education",
};

export default function CareersPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <CareersSection />
      </main>
      <Footer />
    </>
  );
}
