"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { useRouter } from "next/navigation"

export type Domain = {
  id: string
  domainName: string
  sslExpiresAt: string
}

// Optional formatting helpers
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ActionsCell({ domain }: { domain: Domain }) {
  const router = useRouter()

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: domain.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error refreshing domain:", errorData.error || "Unknown error")
      } else {
        // Successfully refreshed, now reload the table data
        router.refresh()
      }
    } catch (error) {
      console.error("Error refreshing domain:", error)
    }
  }

  const handleRemove = async () => {
    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: domain.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error removing domain:", errorData.error || "Unknown error")
      } else {
        // Successfully removed, now reload the table data
        console.log(`Removed domain: ${domain.domainName}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error removing domain:", error)
    }
  }

  return (
    <div className="text-start pl-10 flex space-x-2">
      <Button variant="outline" onClick={handleRefresh}>
        Refresh
      </Button>
      <Button variant="destructive" onClick={handleRemove}>
        Remove
      </Button>
    </div>
  )
}

export const columns: ColumnDef<Domain>[] = [
  {
    accessorKey: "domainName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="font-medium"
      >
        Domain Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("domainName") as string
      return <span className="font-medium pl-10">{name}</span>
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "sslExpiresAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="font-medium text-right"
      >
        SSL Expires At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("sslExpiresAt") as string
      return <div className="text-start pl-10">{formatDate(date)}</div>
    },
    sortingFn: "datetime",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const domain = row.original
      return <ActionsCell domain={domain} />
    },
    enableSorting: false,
    enableHiding: false,
  },
]
