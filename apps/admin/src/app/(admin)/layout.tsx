import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

/**
 * @component
 * @description 인증된 관리자 페이지 공통 레이아웃. 데스크톱: 사이드바 + 콘텐츠 / 모바일: 상단 헤더 + 드로어
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          {children}
        </div>
      </div>
    </div>
  );
}
