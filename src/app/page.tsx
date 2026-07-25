import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center">
        <span className="rounded-full border px-4 py-2 text-sm font-medium">
          AI Powered ERP
        </span>

        <h1 className="mt-8 text-6xl font-extrabold tracking-tight">
          Atlas ERP
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Modern enterprise resource planning built for inventory,
          procurement, HR, finance and AI-powered business workflows.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg border px-6 py-3"
          >
            Register Company
          </Link>
        </div>
      </section>
    </main>
  );
}