import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <main className="min-h-screen bg-black text-white flex">

      <Sidebar />

      <section className="flex-1 p-8">
        {children}
      </section>

    </main>
  );
}