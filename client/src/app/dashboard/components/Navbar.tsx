"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../auth-provider";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Dashboard" }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center px-8 py-5 gap-4 shrink-0">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Search */}
      <div className="w-72 relative">
        <svg
          className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search athletes, decisions…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/70 border border-black/8 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition placeholder-gray-400 text-gray-700"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-xl transition">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
      </button>

      {/* Profile */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowProfile((v) => !v)}
          className="flex items-center gap-2 px-2 py-1.5 hover:bg-black/5 rounded-xl transition"
        >
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showProfile && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
            <div className="px-3 py-2.5 border-b border-gray-50">
              <div className="text-xs font-semibold text-gray-800">{user?.name ?? "User"}</div>
              <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
            </div>
            <button className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
              Settings
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
