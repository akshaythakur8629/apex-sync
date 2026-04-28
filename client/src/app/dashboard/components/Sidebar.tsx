"use client";

import { useAuth } from "../../auth-provider";

type Section =
  | "overview"
  | "athletes"
  | "teams"
  | "users"
  | "decisions"
  | "audit"
  | "settings";

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  future?: boolean;
}

interface SidebarProps {
  active: Section;
  onChange: (s: Section) => void;
  conflictCount?: number;
  onAddAthlete?: () => void;
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export function Sidebar({ active, onChange, conflictCount = 0, onAddAthlete }: SidebarProps) {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <NavIcon d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
    },
    {
      id: "athletes",
      label: "Athlete Status",
      icon: <NavIcon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
      badge: conflictCount > 0 ? conflictCount : undefined,
    },
    {
      id: "teams",
      label: "Teams",
      icon: <NavIcon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
    },
    {
      id: "users",
      label: "Users",
      icon: <NavIcon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
    },
    {
      id: "decisions",
      label: "Decision Logs",
      icon: <NavIcon d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />,
      future: true,
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: <NavIcon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
      future: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <NavIcon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
      future: true,
    },
  ];

  function NavButton({ id, label, icon, badge, future }: NavItem) {
    const isActive = active === id;
    return (
      <button
        onClick={() => !future && onChange(id)}
        disabled={future}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
          ${isActive
            ? "bg-orange-500 text-white"
            : future
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-400 hover:bg-white/8 hover:text-gray-200"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <span className={isActive ? "text-white" : future ? "text-gray-600" : "text-gray-500"}>
            {icon}
          </span>
          <span className={isActive ? "font-semibold" : ""}>{label}</span>
        </span>

        <span className="flex items-center gap-1.5">
          {badge !== undefined && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none ${
              isActive ? "bg-white/25 text-white" : "bg-orange-500 text-white"
            }`}>
              {badge}
            </span>
          )}
          {future && (
            <span className="text-[9px] font-semibold text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-md leading-none">
              Soon
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <aside className="w-56 bg-[#111111] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm tracking-tight">A</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">ApexSync</div>
            <div className="text-gray-500 text-[10px] mt-0.5">PMIS</div>
          </div>
        </div>
      </div>

      {/* Create new CTA */}
      <div className="px-4 pb-4 shrink-0">
        <button className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl py-2.5 transition">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create new
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px bg-white/8 shrink-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => <NavButton key={item.id} {...item} />)}

        {/* Add Athlete action */}
        <div className="pt-2 pb-1">
          <button
            onClick={onAddAthlete}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/8 hover:text-gray-200 transition-all duration-150"
          >
            <svg className="w-[18px] h-[18px] shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            <span>Add Athlete</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/8 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-gray-200 truncate leading-tight">
              {user?.name ?? "User"}
            </div>
            <div className="text-[10px] text-gray-500 truncate">{user?.email ?? ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
