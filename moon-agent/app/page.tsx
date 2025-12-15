"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Next.js 14 App Router with Tailwind CSS",
  "Shadcn/UI ready with violet gradient theme",
  "Supabase client bootstrap & testing scaffold"
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-24 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground shadow-sm">
              Moon Agent · Next.js Foundation
            </p>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Kickstart the Moon Agent workspace with a{" "}
              <span className="bg-clip-text text-transparent bg-violet-gradient">
                violet-gradient
              </span>{" "}
              design system.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Pre-wired with Tailwind, Shadcn UI components, and Supabase
              client hooks so you can focus on building the core experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="shadow-lg shadow-violet-400/30">
                Launch workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                View documentation
              </Button>
            </div>
          </div>

          <div className="rounded-2xl p-[1px] gradient-card">
            <div className="glass rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-foreground">
                Project snapshot
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {features.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 shadow-sm dark:bg-slate-900/60"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

