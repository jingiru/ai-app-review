import type { SessionUser, SortOption } from "@/lib/types";

type HeaderProps = {
  user: SessionUser | null;
  search: string;
  sortBy: SortOption;
  darkMode: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onToggleDarkMode: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSubmission: () => void;
};

export function Header({
  user,
  search,
  sortBy,
  darkMode,
  onSearchChange,
  onSortChange,
  onToggleDarkMode,
  onOpenLogin,
  onLogout,
  onOpenSubmission,
}: HeaderProps) {
  return (
    <header className="rounded-[2rem] bg-white/90 p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200/70 backdrop-blur dark:bg-slate-900/90 dark:shadow-black/20 dark:ring-slate-800 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            <span aria-hidden="true">✨</span>
            수업 프로젝트 공유 공간
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">반별 웹앱 리뷰 시스템</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 md:text-base">
            친구들이 만든 웹앱을 둘러보고, 더 좋아질 수 있는 기능 개선 아이디어를 댓글로 남겨 보세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {darkMode ? "☀️ 라이트" : "🌙 다크"}
          </button>
          {user ? (
            <>
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                {user.name} · {user.studentId} · {user.classNo}반
              </div>
              <button type="button" onClick={onOpenSubmission} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                내 웹앱 제출
              </button>
              <button type="button" onClick={onLogout} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onOpenSubmission} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-900">
                내 웹앱 제출
              </button>
              <button type="button" onClick={onOpenLogin} className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                로그인
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="이름, 학번, 웹앱 제목으로 검색"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-950"
          />
        </label>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-950"
        >
          <option value="studentId">학번 오름차순</option>
          <option value="name">이름 오름차순</option>
          <option value="latest">최신 제출순</option>
          <option value="reviews">리뷰 많은 순</option>
        </select>
      </div>
    </header>
  );
}
