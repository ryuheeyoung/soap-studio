import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import MoldForm from "@/components/molds/MoldForm";
import { createMoldAction } from "@/lib/actions/molds";

/**
 * @component
 * @description 몰드 추가 페이지
 */
export default function NewMoldPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Link
        href="/molds"
        className="flex w-fit items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ChevronLeft size={16} />
        몰드 목록
      </Link>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">몰드 추가</h1>

      <div className="max-w-md">
        <MoldForm action={createMoldAction} submitLabel="추가하기" />
      </div>
    </div>
  );
}
