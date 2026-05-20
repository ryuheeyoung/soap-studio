"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, BookOpen, Layers, LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

// 사이드바와 동일한 네비게이션 항목
const NAV_ITEMS = [
  { href: "/ingredients", label: "재료 관리", icon: FlaskConical },
  { href: "/molds", label: "몰드 관리", icon: Layers },
  { href: "/recipes", label: "레시피 관리", icon: BookOpen },
] as const;

/**
 * @component
 * @description 모바일 전용 상단 헤더. 햄버거 버튼으로 슬라이드 드로어 메뉴를 열고 닫음 (md 이상에서는 숨김)
 */
export default function MobileHeader() {
  // 드로어 열림 상태
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 모바일 상단 헤더 바 */}
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Soap Studio
        </span>
        <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Admin
        </span>
      </header>

      {/* 드로어 뒷배경 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 슬라이드 드로어 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:hidden dark:border-zinc-800 dark:bg-zinc-950 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Soap Studio
            </span>
            <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Admin
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="메뉴 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            >
              <LogOut size={16} strokeWidth={1.8} />
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
