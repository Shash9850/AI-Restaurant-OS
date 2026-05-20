export default function DashboardPage() {

  return (
    <div>

      <div className="mb-10">

        <h1 className="text-4xl font-bold mb-2">
          Dashboard
        </h1>

        <p className="text-zinc-400">
          Welcome back to your restaurant control center
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-zinc-400 mb-2">
            Total Orders
          </h2>

          <p className="text-4xl font-bold">
            128
          </p>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-zinc-400 mb-2">
            Revenue
          </h2>

          <p className="text-4xl font-bold">
            ₹45,000
          </p>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-zinc-400 mb-2">
            Active Tables
          </h2>

          <p className="text-4xl font-bold">
            12
          </p>

        </div>

      </div>

    </div>
  );
}