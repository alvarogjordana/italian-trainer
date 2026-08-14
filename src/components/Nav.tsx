"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface Item {
  href: string;
  label: string;
  icon: ReactNode;
}

const I = ({ d }: { d: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const items: Item[] = [
  { href: "/", label: "Ripasso", icon: <I d="M3 5h18M3 12h18M3 19h18" /> },
  {
    href: "/typing",
    label: "Scrittura",
    icon: <I d="M4 7V5h16v2M9 20h6M12 5v15" />,
  },
  {
    href: "/verbs",
    label: "Verbi",
    icon: <I d="M12 2v20M2 12h20M5 5l14 14" />,
  },
  {
    href: "/browse",
    label: "Sfoglia",
    icon: <I d="M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />,
  },
  {
    href: "/stats",
    label: "Statistiche",
    icon: <I d="M3 3v18h18M8 15v3M13 10v8M18 6v12" />,
  },
  {
    href: "/data",
    label: "Dati",
    icon: <I d="M12 3C7 3 4 5 4 7s3 4 8 4 8-2 8-4-3-4-8-4zM4 7v10c0 2 3 4 8 4s8-2 8-4V7" />,
  },
];

function ThemeToggle() {
  const { settings, updateSettings } = useStore();
  const dark = settings.theme === "dark";
  return (
    <button
      type="button"
      onClick={() => updateSettings({ theme: dark ? "light" : "dark" })}
      aria-label={dark ? "Passa al tema chiaro" : "Passa al tema scuro"}
      title="Tema chiaro / scuro"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted hover:text-accent"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop / tablet: top bar */}
      <header className="sticky top-0 z-20 hidden border-b border-border bg-bg/85 backdrop-blur md:block">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2.5">
          <Link href="/" className="mr-3 flex items-center gap-2 font-semibold">
            <span className="text-lg">🇮🇹</span>
            <span>Impara l&apos;italiano</span>
          </Link>
          <nav className="flex items-center gap-1">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(it.href)
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {it.icon}
                <span>{it.label}</span>
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-6">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                isActive(it.href) ? "text-accent" : "text-muted",
              )}
            >
              {it.icon}
              <span className="leading-none">{it.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
