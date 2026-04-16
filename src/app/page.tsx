export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI Inspector</h1>
        <p className="text-gray-600 text-lg">
          Track which LLM crawlers, search bots, and humans visit your content.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
          <a
            href="/sample.html"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <span className="block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
              Tracked page
            </span>
            <span className="text-lg font-semibold text-gray-800">sample.html</span>
            <p className="text-sm text-gray-500 mt-1">Plain HTML content page — every visit is logged.</p>
          </a>

          <a
            href="/sample.md"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <span className="block text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-1">
              Tracked page
            </span>
            <span className="text-lg font-semibold text-gray-800">sample.md</span>
            <p className="text-sm text-gray-500 mt-1">Markdown content page — every visit is logged.</p>
          </a>

          <a
            href="/dashboard"
            className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <span className="block text-xs font-semibold uppercase tracking-widest text-purple-600 mb-1">
              Analytics
            </span>
            <span className="text-lg font-semibold text-gray-800">Dashboard</span>
            <p className="text-sm text-gray-500 mt-1">Live statistics: LLM providers, bots, humans.</p>
          </a>
        </div>
      </div>
    </main>
  );
}
