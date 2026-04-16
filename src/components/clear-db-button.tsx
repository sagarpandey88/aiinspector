"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ClearDbButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClear() {
    if (!confirm("Clear all request logs? This cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/stats`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      console.error("Failed to clear DB", err);
      alert("Failed to clear database. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleClear} disabled={loading}>
      {loading ? "Clearing…" : "Clear DB"}
    </Button>
  );
}
