import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  Database,
  Layers3,
  LockKeyhole,
  Package,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Workflow,
} from "lucide-react";

import Navbar from "@/components/home/navbar";

export default function HomePage() {
  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Track products, stock levels, warehouses, movements and inventory operations from one centralized system.",
    },
    {
      icon: Workflow,
      title: "Procurement",
      description:
        "Manage purchase requests, purchase orders, suppliers, goods receipts and procurement workflows.",
    },
    {
      icon: Users,
      title: "Human Resources",
      description:
        "Manage employees, departments, roles, permissions and organizational access with complete control.",
    },
    {
      icon: WalletCards,
      title: "Finance & Operations",
      description:
        "Bring invoices, expenses, financial workflows and operational data together in one workspace.",
    },
    {
      icon: BrainCircuit,
      title: "AI-Powered Workflows",
      description:
        "Use AI to analyze business information, automate repetitive work and assist with better decisions.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Security",
      description:
        "Control exactly what every employee can access through roles, permissions and secure company boundaries.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create your company",
      description:
        "Register your organization and create the administrator account for your Atlas workspace.",
    },
    {
      number: "02",
      title: "Set up your organization",
      description:
        "Configure departments, employees, roles and permissions according to your business structure.",
    },
    {
      number: "03",
      title: "Run your operations",
      description:
        "Manage inventory, procurement, HR, finance and other business workflows from a single ERP.",
    },
    {
      number: "04",
      title: "Make smarter decisions",
      description:
        "Use centralized data and AI-powered capabilities to understand your business and improve operations.",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <Navbar />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.15),transparent_45%)]" />

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Enterprise Resource Planning
            </div>

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Run your entire business
              <span className="block text-primary">
                from one intelligent workspace.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Atlas ERP brings inventory, procurement, HR,
              finance and business operations together in one
              modern platform — with AI built into the workflow.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Start your workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border bg-background px-7 text-base font-semibold transition-colors hover:bg-muted"
              >
                Sign in to Atlas
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Multi-company ready
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Role-based access
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                AI-powered workflows
              </div>
            </div>
          </div>

          {/* Product Preview */}
          <div className="mx-auto mt-20 max-w-6xl">
            <div className="relative rounded-2xl border bg-card p-2 shadow-2xl">
              <div className="rounded-xl border bg-muted/30 p-5">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Layers3 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Atlas ERP
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Business workspace
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-2 w-20 rounded-full bg-muted" />
                    <div className="h-8 w-8 rounded-full bg-muted" />
                  </div>
                </div>

                <div className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    "Inventory",
                    "Procurement",
                    "Employees",
                    "Finance",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border bg-background p-5"
                    >
                      <div className="h-2 w-16 rounded-full bg-primary/20" />

                      <p className="mt-5 font-semibold">
                        {item}
                      </p>

                      <div className="mt-4 h-2 w-full rounded-full bg-muted" />
                      <div className="mt-2 h-2 w-3/4 rounded-full bg-muted" />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="h-48 rounded-xl border bg-background p-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Business Overview
                      </p>

                      <Database className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="mt-8 flex h-24 items-end gap-3">
                      {[35, 55, 42, 75, 60, 85, 70].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-primary/20"
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <div className="h-48 rounded-xl border bg-background p-5">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary" />

                      <p className="font-semibold">
                        AI Assistant
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="h-8 rounded-lg bg-muted" />
                      <div className="h-8 w-4/5 rounded-lg bg-muted" />
                      <div className="h-8 w-3/5 rounded-lg bg-primary/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Everything connected
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              One platform for your entire operation.
            </h2>

            <p className="mt-4 text-lg text-muted-foreground">
              Stop managing different parts of your business
              across disconnected systems. Atlas brings your
              organization together.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 leading-7 text-muted-foreground">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex items-center text-sm font-medium text-primary">
                    Explore capability
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Simple by design
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From setup to operation in four steps.
            </h2>

            <p className="mt-4 text-lg text-muted-foreground">
              Atlas is designed to grow with your organization,
              without making your team fight the software.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative"
              >
                <span className="text-5xl font-black text-primary/10">
                  {step.number}
                </span>

                <h3 className="mt-2 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section
        id="security"
        className="border-y bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LockKeyhole className="h-6 w-6" />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Your business data stays under your control.
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Atlas is built around company-level isolation,
                authentication and role-based authorization so
                employees only get access to what they need.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Role-based access",
                },
                {
                  icon: LockKeyhole,
                  title: "Permission controls",
                },
                {
                  icon: Building2,
                  title: "Company isolation",
                },
                {
                  icon: Settings2,
                  title: "Centralized administration",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border bg-background p-5"
                  >
                    <Icon className="h-5 w-5 text-primary" />

                    <p className="mt-4 font-semibold">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to bring your business together?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Create your Atlas workspace and start building a
            smarter, more connected organization.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground"
            >
              Create your workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border px-7 font-semibold hover:bg-muted"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>

            <span className="font-semibold text-foreground">
              Atlas ERP
            </span>
          </div>

          <p>
            Modern ERP for modern businesses.
          </p>

          <div className="flex gap-5">
            <Link
              href="/terms"
              className="hover:text-foreground"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-foreground"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}