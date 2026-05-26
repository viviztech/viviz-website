import Link from "next/link";
import { Zap, Mail, X, Link2, GitFork, Phone, MapPin } from "lucide-react";
import {
  COMPANY_EMAIL,
  COMPANY_PHONE_1,
  COMPANY_PHONE_2,
  COMPANY_ADDRESS,
} from "@/lib/config";

const footerLinks = {
  Company: [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Contact", href: "/contact" },
  ],
  Products: [
    { label: "Viviz CRM", href: "/products" },
    { label: "AI Agents", href: "/services#ai-agents" },
    { label: "Data Science", href: "/services#data-science" },
    { label: "Marketing Automation", href: "/services#marketing-automation" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080E1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand + contact info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">Viviz</span>
                <span className="text-[#00D4FF]"> Technologies</span>
              </span>
            </Link>
            <p className="text-[#64748B] text-sm leading-relaxed max-w-xs mb-5">
              Building intelligent software that empowers businesses to grow
              faster with AI, automation, and data science.
            </p>

            {/* Contact details */}
            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#475569] mt-0.5 shrink-0" />
                <span className="text-[#64748B] text-xs leading-relaxed">
                  {COMPANY_ADDRESS}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#475569] shrink-0" />
                <div className="flex gap-3 text-xs">
                  <a href={`tel:${COMPANY_PHONE_1}`} className="text-[#64748B] hover:text-[#00D4FF] transition-colors">
                    {COMPANY_PHONE_1}
                  </a>
                  <span className="text-[#334155]">/</span>
                  <a href={`tel:${COMPANY_PHONE_2}`} className="text-[#64748B] hover:text-[#00D4FF] transition-colors">
                    {COMPANY_PHONE_2}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#475569] shrink-0" />
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="text-[#64748B] hover:text-[#00D4FF] transition-colors text-xs"
                >
                  {COMPANY_EMAIL}
                </a>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${COMPANY_EMAIL}`}
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://twitter.com/viviztechnologies"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                aria-label="Twitter / X"
              >
                <X size={16} />
              </a>
              <a
                href="https://linkedin.com/company/viviz-technologies"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Link2 size={16} />
              </a>
              <a
                href="https://github.com/viviz-technologies"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                aria-label="GitHub"
              >
                <GitFork size={16} />
              </a>
            </div>
          </div>

          {/* Nav links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#475569]">
            © {new Date().getFullYear()} Viviz Technologies. All rights reserved.
          </p>
          <p className="text-sm text-[#475569]">
            Built with AI · Powered by innovation
          </p>
        </div>
      </div>
    </footer>
  );
}
