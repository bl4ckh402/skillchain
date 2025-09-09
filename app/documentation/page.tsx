import { DocumentationSection } from "@/components/ui/documentation"
import { Footer } from "@/components/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation | SkillChain",
  description: "Comprehensive documentation and guides for the SkillChain platform",
}

export default function DocumentationPage() {
  return (
    <>
      <main className="flex flex-col min-h-screen">
        <DocumentationSection />
      </main>
      <Footer />
    </>
  )
}


