import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="h-96 rounded-lg border-4 border-dashed border-gray-200">
            <div className="flex h-full flex-col items-center justify-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Welcome {session?.user?.name || session?.user?.email}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first brief
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  New Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
