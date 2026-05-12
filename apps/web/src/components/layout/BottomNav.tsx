"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Calculator, FlaskConical } from "lucide-react";

// 하단 네비게이션 메뉴 항목 정의
const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/recipes", label: "레시피", icon: BookOpen },
  { href: "/calculator", label: "계산기", icon: Calculator },
  { href: "/ingredients", label: "재료", icon: FlaskConical },
] as const;

/**
 * @component
 * @description 모바일 하단 고정 네비게이션 바. 현재 경로에 따라 활성 탭 표시
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <ul className="flex h-16 items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
