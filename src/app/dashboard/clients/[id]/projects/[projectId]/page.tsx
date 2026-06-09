import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import Link from "next/link";
import NotesSection from "@/components/NotesSection";
import { createClient as createAdmin } from "@supabase/supabase-js";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
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

  const { data: project } = await adminSupabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (!project) notFound();

  const { data: notes } = await adminSupabase
    .from("notes")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const name = user.user_metadata?.full_name || user.email;

  const STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-200",
    in_review: "bg-blue-50 text-blue-600 border-blue-200",
    completed: "bg-[#EEE9FF] text-[#5B4EE8] border-[#DDD8FF]",
    on_hold: "bg-amber-50 text-amber-600 border-amber-200",
  };

  const STATUS_LABELS: Record<string, string> = {
    active: "Active",
    in_review: "In Review",
    completed: "Completed",
    on_hold: "On Hold",
  };

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

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#9B90C2] mb-8">
          <Link href="/dashboard" className="hover:text-[#5B4EE8] transition-colors">Clients</Link>
          <span>/</span>
          <Link href={`/dashboard/clients/${id}`} className="hover:text-[#5B4EE8] transition-colors">{client.name}</Link>
          <span>/</span>
          <span className="text-[#1A1035] font-medium">{project.title}</span>
        </div>

        {/* Project header */}
        <div className="bg-white border border-[#DDD8FF] rounded-2xl px-6 py-5 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-[#1A1035] mb-1">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-[#9B90C2]">{project.description}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[project.status]}`}>
              {STATUS_LABELS[project.status]}
            </span>
          </div>
        </div>

        <NotesSection initialNotes={notes || []} projectId={projectId} />
      </main>
    </div>
  );
}