"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Client = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  created_at: string;
};

export default function ClientsSection({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddClient() {
    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setClients([data, ...clients]);
    setName("");
    setEmail("");
    setCompany("");
    setShowModal(false);
    setLoading(false);
    router.refresh();
  }

  function closeModal() {
    setShowModal(false);
    setName("");
    setEmail("");
    setCompany("");
    setError("");
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[#1A1035]">
          Clients{" "}
          <span className="text-[#9B90C2] font-normal text-sm">({clients.length})</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#5B4EE8] hover:bg-[#4A3ED6] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors shadow-md shadow-[#5B4EE8]/20 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#DDD8FF] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#5B4EE8]">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-[#1A1035] text-sm font-medium mb-1">No clients yet</p>
          <p className="text-[#9B90C2] text-xs mb-6">Add your first client to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#5B4EE8] hover:bg-[#4A3ED6] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors shadow-md shadow-[#5B4EE8]/30"
          >
            Add client
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="bg-white border border-[#DDD8FF] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#5B4EE8]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[#EEE9FF] flex items-center justify-center text-[#5B4EE8] text-sm font-semibold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1035]">{client.name}</p>
                  <p className="text-xs text-[#9B90C2]">
                    {client.company || client.email || "No details added"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#C4BBEE]">
                {new Date(client.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-[#1A1035]/30 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white border border-[#DDD8FF] rounded-2xl p-8 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1A1035]">New client</h2>
              <button onClick={closeModal} className="text-[#9B90C2] hover:text-[#5B4EE8] transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">
                  Name <span className="text-[#5B4EE8]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@company.com"
                  className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7B6F9E] mb-1.5">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="PT Maju Jaya"
                  onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
                  className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all"
                />
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
                  onClick={handleAddClient}
                  disabled={loading}
                  className="flex-1 bg-[#5B4EE8] hover:bg-[#4A3ED6] disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors shadow-md shadow-[#5B4EE8]/30"
                >
                  {loading ? "Saving..." : "Add client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}