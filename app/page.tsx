import { AddDomainForm } from "@/components/addDomain"
import { columns, Domain } from "@/components/columns"
import { DataTable } from "@/components/ui/data-table"
import { UserButton } from "@clerk/nextjs"
import  prisma  from "@/lib/prismadb"

// Use 'no-store' to ensure the page isn't cached and always fetches fresh data.
// This might not be necessary depending on your use case, but it's often useful
// when displaying live database data that changes frequently.
export const revalidate = 0; 

export default async function DashboardPage() {
  // Fetch your domain data from the database
  const domainsFromDb = await prisma.domain.findMany({
    orderBy: { createdAt: "desc" }, // optional: sort by newest first
  })

  // Map the domains to match the `Domain` type if needed
  const domainData: Domain[] = domainsFromDb.map((d) => ({
    id: d.id,
    domainName: d.domainName,
    sslExpiresAt: d.sslExpiresAt.toISOString(),
  }))

  return (
    <div className="w-full flex flex-col space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between p-10">
        <h1 className="text-3xl font-bold">GDM Domains</h1>
        <UserButton />
        <div>
          <AddDomainForm />
        </div>
      </div>
      <DataTable columns={columns} data={domainData} />
    </div>
  )
}
