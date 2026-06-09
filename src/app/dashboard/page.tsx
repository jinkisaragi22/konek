import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import ClientsSection from "@/components/ClientsSection";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const name = user.user_metadata?.full_name || user.email;

  return (
    <div className="min-h-screen bg-[#F0EEFF]">
      {/* Navbar */}
      <header className="bg-white border-b border-[#DDD8FF] px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-[#1A1035]">
          konek<span className="text-[#5B4EE8]">.</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#7B6F9E]">{name}</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-[#9B90C2] hover:text-[#5B4EE8] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-[#1A1035] mb-1">
            Good to see you, {name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[#7B6F9E] text-sm">Manage your clients and projects.</p>
        </div>

        <ClientsSection initialClients={clients || []} />
      </main>
    </div>
  );
}