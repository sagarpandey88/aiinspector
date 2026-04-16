import type { StatsResponse } from "@/app/api/stats/route";
import { Badge } from "@/components/ui/badge";
import ClearDbButton from "@/components/clear-db-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getStats(): Promise<StatsResponse | { error: string } | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/stats`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      let bodyText = "";
      try {
        bodyText = await res.text();
      } catch (e) {
        bodyText = res.statusText || `HTTP ${res.status}`;
      }
      return { error: `Stats API error ${res.status}: ${bodyText}` };
    }
    return res.json();
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function CategoryBadge({ category }: { category: string | null }) {
  const map: Record<string, string> = {
    llm: "bg-purple-100 text-purple-800",
    search: "bg-blue-100 text-blue-800",
    monitor: "bg-yellow-100 text-yellow-800",
    scraper: "bg-red-100 text-red-800",
    browser: "bg-green-100 text-green-800",
  };
  const cls = map[category ?? ""] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {category ?? "unknown"}
    </span>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  if (!stats || (stats && "error" in stats)) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Inspector Dashboard</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
          <p className="font-semibold">Could not connect to the database.</p>
          <p className="text-sm mt-1">
            Make sure PostgreSQL is running and <code>.env.local</code> is configured, then run{" "}
            <code>psql … -f schema.sql</code>.
          </p>
          {stats && "error" in stats ? (
            <pre className="mt-3 p-3 bg-white rounded border text-xs text-red-800 overflow-auto">{stats.error}</pre>
          ) : null}
        </div>
      </main>
    );
  }

  const { summary, byLlmProvider, byBotCategory, byFileType, topUserAgents, recentRequests } = stats;

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Inspector</h1>
          <p className="text-gray-500 text-sm mt-1">LLM crawler &amp; bot tracking dashboard</p>
        </div>
        <div className="flex gap-3 text-sm items-center">
          <a href="/sample.html" className="underline text-blue-600">sample.html</a>
          <a href="/sample.md" className="underline text-blue-600">sample.md</a>
          <ClearDbButton />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Requests", value: summary.total, color: "text-gray-900" },
          { label: "LLM Crawlers", value: summary.llm, color: "text-purple-700" },
          { label: "Other Bots", value: summary.bots, color: "text-red-700" },
          { label: "Humans", value: summary.humans, color: "text-green-700" },
          { label: "HTML hits", value: summary.htmlRequests, color: "text-blue-700" },
          { label: "MD hits", value: summary.mdRequests, color: "text-indigo-700" },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-3xl font-bold ${c.color}`}>{c.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LLM providers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">LLM Providers</CardTitle>
          </CardHeader>
          <CardContent>
            {byLlmProvider.length === 0 ? (
              <p className="text-sm text-gray-400">No LLM crawlers yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byLlmProvider.map((r) => (
                    <TableRow key={r.llm_provider}>
                      <TableCell className="font-medium">{r.llm_provider}</TableCell>
                      <TableCell className="text-right">{r.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bot categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Caller Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byBotCategory.map((r) => (
                  <TableRow key={r.bot_category}>
                    <TableCell>
                      <CategoryBadge category={r.bot_category} />
                    </TableCell>
                    <TableCell className="text-right">{r.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* File type breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hits by File Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byFileType.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant="outline">.{r.file_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.is_llm_crawler ? (
                        <span className="text-purple-700 font-medium">LLM</span>
                      ) : (
                        <span className="text-gray-500">non-LLM</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{r.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top User Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top User Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Agent</TableHead>
                <TableHead className="text-right w-24">Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUserAgents.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs truncate max-w-xl">{r.user_agent}</TableCell>
                  <TableCell className="text-right">{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Requests (last 50)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Provider / Bot</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Sec-Fetch-Site</TableHead>
                <TableHead className="text-right">ms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap text-gray-500">
                    {new Date(r.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">.{r.file_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={r.bot_category} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.llm_provider ?? r.bot_name ?? <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.ip_address ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.country_code ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {r.sec_fetch_site ?? <span className="text-gray-400 italic">absent</span>}
                  </TableCell>
                  <TableCell className="text-right text-xs">{r.response_time_ms ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
