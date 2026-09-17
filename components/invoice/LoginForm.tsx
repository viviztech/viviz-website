"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function LoginForm({ title = "Invoice Generator", destination = "/invoice" }: { title?: string; destination?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/invoice-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm p-8 rounded-2xl border border-white/5 bg-[#0F1929] space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center shrink-0">
          <Lock size={16} className="text-[#00D4FF]" />
        </div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Password</label>
        <input
          required
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
          placeholder="Enter password"
        />
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Log In"}
      </button>
    </form>
  );
}
