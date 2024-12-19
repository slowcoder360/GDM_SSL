"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AddDomainForm() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleAddDomains() {
    const trimmed = domain.trim();
    if (!trimmed) return;

    const domainList = trimmed.split(",").map(d => d.trim()).filter(Boolean);

    setLoading(true);
    setError(null);

    let anyErrors = false;

    for (const d of domainList) {
      try {
        const response = await fetch("/api/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: d }),
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || `Failed to add domain: ${d}`);
          anyErrors = true;
        }
      } catch (unknownError) {
        let message = `Unexpected error for domain ${d}`;
        if (unknownError instanceof Error) {
          message += `: ${unknownError.message}`;
        }
        setError(message);
        anyErrors = true;
      }
    }

    setLoading(false);
    if (!anyErrors) {
      // Refresh the table data to show all newly added domains
      router.refresh();
      setDomain(""); // Clear input
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Enter a new domain..."
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddDomains} disabled={loading}>
          {loading ? "Adding..." : "Add Domain"}
        </Button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
