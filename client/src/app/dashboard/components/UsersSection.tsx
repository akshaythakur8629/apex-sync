"use client";

import { useQuery } from "@tanstack/react-query";
import { umsApi } from "@/lib/api";

interface OrgUser {
  id: number;
  name: string | null;
  email: string;
  is_active: boolean;
  roles: { role: { name: string } }[];
}

const ROLE_COLORS: Record<string, string> = {
  "Director of Performance":  "bg-orange-50 text-orange-600 border-orange-100",
  "Head Athletic Trainer":    "bg-blue-50 text-blue-600 border-blue-100",
  "Sports Science Lead":      "bg-purple-50 text-purple-600 border-purple-100",
  "Rehab Lead":               "bg-green-50 text-green-700 border-green-100",
  "Team Physician":           "bg-red-50 text-red-600 border-red-100",
  "Head Coach":               "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Performance Director":     "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Head of Sports Medicine":  "bg-teal-50 text-teal-700 border-teal-100",
};

function roleBadgeColor(roleName: string) {
  return ROLE_COLORS[roleName] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

export function UsersSection() {
  const { data, isLoading, isError } = useQuery<OrgUser[]>({
    queryKey: ["org-users"],
    queryFn: umsApi.getUsers,
    staleTime: 2 * 60_000,
  });

  const users = data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">Staff members with access to your organisation</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Invite member
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="h-3.5 w-32 bg-gray-100 rounded mb-1.5" />
                  <div className="h-2.5 w-44 bg-gray-100 rounded" />
                </div>
                <div className="h-5 w-28 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="px-5 py-12 text-center">
            <div className="text-sm text-gray-400">Unable to load users</div>
            <div className="text-xs text-gray-400 mt-1">Check your permissions or try again.</div>
          </div>
        )}

        {!isLoading && !isError && users.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="text-sm text-gray-400">No users found</div>
          </div>
        )}

        {!isLoading && !isError && users.length > 0 && (
          <>
            <div className="px-5 py-3 border-b border-gray-50 grid grid-cols-[1fr_auto_auto] gap-4">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Member</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            <div className="divide-y divide-gray-50">
              {users.map((u) => {
                const primaryRole = u.roles?.[0]?.role?.name ?? "Member";
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition group"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                      {(u.name ?? u.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{u.name ?? u.email.split("@")[0]}</div>
                      <div className="text-xs text-gray-400 truncate">{u.email}</div>
                    </div>
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full shrink-0 ${roleBadgeColor(primaryRole)}`}>
                      {primaryRole}
                    </span>
                    <span
                      className={`text-[10px] font-medium shrink-0 ${
                        u.is_active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
