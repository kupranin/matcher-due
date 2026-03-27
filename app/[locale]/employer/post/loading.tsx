import Logo from "@/components/Logo";

export default function EmployerPostLoading() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo height={80} />
          <span className="text-sm text-gray-500">← Back</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-matcher border-t-transparent" aria-hidden />
        <p className="text-sm text-gray-600">Loading…</p>
      </main>
    </div>
  );
}
