import { loginAction } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

/**
 * @component
 * @description 관리자 로그인 페이지. 비밀번호 입력 후 세션 발급
 * @param {string} props.searchParams.error - 로그인 실패 시 전달되는 에러 플래그
 */
export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Soap Studio Admin
        </h1>

        <form action={loginAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-700"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">비밀번호가 올바르지 않아요.</p>
          )}

          <button
            type="submit"
            className="mt-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
