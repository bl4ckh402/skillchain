import { FAQSection } from "@/components/ui/faq";
import React from "react";
import { Footer } from "@/components/footer";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "FAQ | SkillChain",
  description:
    "Frequently Asked Questions about SkillChain's blockchain education platform.",
};
export default function FAQPage() {
  return (
    <>
      {" "}
      <main className="flex flex-col min-h-screen">
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
