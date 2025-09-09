import Link from "next/link";
import { Code2, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 border-t bg-background md:py-12">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-primary" />
              <span className="font-bold">SkillChain</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The premier platform for blockchain education and course creation
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  My Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Create Course
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/documentation"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:contact@skillchain.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="w-4 h-4" />
                  contact@skillchain.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+254718540760"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="w-4 h-4" />
                  +254-718-540-760
                </a>
              </li>
              <li>
                <address className="flex items-center gap-2 not-italic text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Nairobi, Kenya</span>
                </address>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 text-sm text-center border-t text-muted-foreground">
          © {new Date().getFullYear()}. SkillChain and its associated
          trademarks, branding, and digital assets are the intellectual property
          of MUUIA Ltd. Unauthorized reproduction, distribution, or modification
          of any content, including but not limited to text, graphics, logos,
          platform code, and user-generated content, is strictly prohibited.
          SkillChain is a community-driven skill-sharing platform designed to
          connect learners and educators. It does not constitute professional,
          educational, or financial advice. Users are responsible for ensuring
          compliance with applicable regulations, including data protection laws
          and any relevant guidelines issued by regulatory authorities in their
          jurisdiction. For inquiries, collaborations, or regulatory concerns,
          please contact: +254-718-540-760 .
        </div>
      </div>
    </footer>
  );
}
