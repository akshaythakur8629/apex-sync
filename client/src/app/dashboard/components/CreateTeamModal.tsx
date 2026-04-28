"use client";

import { useState, useEffect, useRef } from "react";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (team: { name: string; description: string }) => void;
}

export function CreateTeamModal({ open, onClose, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSubmitting(false);
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    // Simulated delay — replace with real API call when teams endpoint is ready
    await new Promise((r) => setTimeout(r, 600));
    onCreated({ name: name.trim(), description: description.trim() });
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create team</h2>
            <p className="text-xs text-gray-400 mt-0.5">Teams group athletes for unified tracking and decision routing.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Team name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              placeholder="e.g. First Team, U-23 Squad, Rehab Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Brief description of this team's purpose or scope…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating…
                </>
              ) : (
                "Create team"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
