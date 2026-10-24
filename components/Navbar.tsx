"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Website Packages" },
  { href: "/website-audit", label: "Free Website Audit" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const open = openFor === pathname;
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B1120]/95 backdrop-blur-md border-b border-white/5 shadow-sm shadow-black/30"
          : "bg-[#0B1120] border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-white">Viviz</span>
              <span className="text-[#00D4FF]"> Technologies</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-[#00D4FF] bg-[#00D4FF]/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden xl:flex items-center gap-3">
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="xl:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-[#00D4FF]"
            onClick={() => setOpenFor(open ? null : pathname)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-navigation" className="xl:hidden bg-[#0B1120]/98 backdrop-blur-md border-t border-white/5">
          <nav aria-label="Mobile navigation" className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpenFor(null)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[#00D4FF] bg-[#00D4FF]/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpenFor(null)}
              className="mt-3 px-4 py-3 text-sm font-semibold text-center rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
