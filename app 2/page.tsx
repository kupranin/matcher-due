export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
        Connected to localhost
      </h1>
      <p className="text-zinc-600">
        Matcher is running. Open{" "}
        <a
          href="http://127.0.0.1:3000"
          className="text-green-600 underline"
        >
          http://127.0.0.1:3000
        </a>{" "}
        in your browser.
      </p>
    </div>
  );
}
