"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, BookOpen, Layers, LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

// 사이드바 네비게이션 메뉴 항목
const NAV_ITEMS = [
  { href: "/ingredients", label: "재료 관리", icon: FlaskConical },
  { href: "/molds", label: "몰드 관리", icon: Layers },
  { href: "/recipes", label: "레시피 관리", icon: BookOpen },
] as const;

/**
 * @component
 * @description 관리자 사이드바 네비게이션. 현재 경로에 따라 활성 메뉴 표시 및 로그아웃 버튼 포함
 */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-5 dark:border-zinc-800">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Soap Studio
        </span>
        <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
          >
            <LogOut size={16} strokeWidth={1.8} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
