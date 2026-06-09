import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import Link from "next/link";
import ProjectsSection from "@/components/ProjectsSection";
import { createClient as createAdmin } from "@supabase/supabase-js";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const adminSupabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: client } = await adminSupabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("freelancer_id", user.id)
    .single();

  if (!client) notFound();

  const { data: projects } = await adminSupabase
    .from("projects")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const name = user.user_metadata?.full_name || user.email;

  return (
    <div className="min-h-screen bg-[#F0EEFF]">
      <header className="bg-white border-b border-[#DDD8FF] px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-[#1A1035]">
          konek<span className="text-[#5B4EE8]">.</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#7B6F9E]">{name}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-[#9B90C2] hover:text-[#5B4EE8] transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#9B90C2] mb-8">
          <Link href="/dashboard" className="hover:text-[#5B4EE8] transition-colors">Clients</Link>
          <span>/</span>
          <span className="text-[#1A1035] font-medium">{client.name}</span>
        </div>

        {/* Client header */}
        <div className="bg-white border border-[#DDD8FF] rounded-2xl px-6 py-5 flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#EEE9FF] flex items-center justify-center text-[#5B4EE8] text-lg font-semibold">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1A1035]">{client.name}</h1>
            <p className="text-sm text-[#9B90C2]">
              {[client.company, client.email].filter(Boolean).join(" · ") || "No details"}
            </p>
          </div>
        </div>

        <ProjectsSection initialProjects={projects || []} clientId={id} />
      </main>
    </div>
  );
}