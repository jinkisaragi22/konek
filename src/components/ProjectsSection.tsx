"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "in_review" | "completed" | "on_hold";
  created_at: string;
};

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

const STATUS_ORDER = ["active", "in_review", "on_hold", "completed"];

export default function ProjectsSection({
  initialProjects,
  clientId,
}: {
  initialProjects: Project[];
  clientId: string;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusClick(e: React.MouseEvent, project: Project) {
    e.stopPropagation();
    const currentIndex = STATUS_ORDER.indexOf(project.status);
    const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length] as Project["status"];

    // Optimistic update
    setUpdatingId(project.id);
    setProjects((prev) =>
      prev.map((p) => p.id === project.id ? { ...p, status: nextStatus } : p)
    );

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      // Revert on failure
      setProjects((prev) =>
        prev.map((p) => p.id === project.id ? { ...p, status: project.status } : p)
      );
    }

    setUpdatingId(null);
    router.refresh();
  }

  async function handleAddProject() {
    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status, clientId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setProjects([data, ...projects]);
    setTitle("");
    setDescription("");
    setStatus("active");
    setShowModal(false);
    setLoading(false);
    router.refresh();
  }

  function closeModal() {
    setShowModal(false);
    setTitle("");
    setDescription("");
    setStatus("active");
    setError("");
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[#1A1035]">
          Projects{" "}
          <span className="text-[#9B90C2] font-normal text-sm">({projects.length})</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#5B4EE8] hover:bg-[#4A3ED6] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors shadow-md shadow-[#5B4EE8]/20 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#DDD8FF] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#5B4EE8]">
              <path d="M4 4h12v12H4V4zm0 4h12M8 4v12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[#1A1035] text-sm font-medium mb-1">No projects yet</p>
          <p className="text-[#9B90C2] text-xs mb-6">Create your first project for this client</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#5B4EE8] hover:bg-[#4A3ED6] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors shadow-md shadow-[#5B4EE8]/30"
          >
            New project
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/clients/${clientId}/projects/${project.id}`}
              className="bg-white border border-[#DDD8FF] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#5B4EE8]/40 hover:shadow-sm transition-all"
            >
              <div>
                <p className="text-sm font-medium text-[#1A1035] mb-1">{project.title}</p>
                {project.description && (
                  <p className="text-xs text-[#9B90C2]">{project.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleStatusClick(e, project)}
                  disabled={updatingId === project.id}
                  title="Click to change status"
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all hover:opacity-70 disabled:opacity-50 cursor-pointer ${STATUS_STYLES[project.status]}`}
                >
                  {STATUS_LABELS[project.status]}
                </button>
                <span className="text-xs text-[#C4BBEE]">
                  {new Date(project.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-[#1A1035]/30 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white border border-[#DDD8FF] rounded-2xl p-8 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1A1035]">New project</h2>
              <button onClick={closeModal} className="text-[#9B90C2] hover:text-[#5B4EE8] transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">
                  Title <span className="text-[#5B4EE8]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Landing page redesign"
                  className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this project about?"
                  rows={3}
                  className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="in_review">In Review</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-[#F7F5FF] hover:bg-[#EEE9FF] text-[#7B6F9E] text-sm font-medium rounded-lg py-2.5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProject}
                  disabled={loading}
                  className="flex-1 bg-[#5B4EE8] hover:bg-[#4A3ED6] disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors shadow-md shadow-[#5B4EE8]/30"
                >
                  {loading ? "Saving..." : "Create project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}