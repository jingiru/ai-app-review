import type { Submission } from "@/lib/types";
import { avatarGradient, getDisplayTitle } from "@/lib/utils";

type SubmissionCardProps = {
  submission: Submission;
  reviewCount: number;
  onOpenReviews: (submission: Submission) => void;
};

export function SubmissionCard({ submission, reviewCount, onOpenReviews }: SubmissionCardProps) {
  return (
    <article className="group rounded-[1.75rem] bg-white p-4 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:shadow-black/20 dark:ring-slate-800">
      <a href={submission.appUrl} target="_blank" rel="noopener noreferrer" className="block text-center" aria-label={`${submission.name} 웹앱 새 탭에서 열기`}>
        <div className="relative mx-auto size-10">
          <div className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(submission.studentId)} text-base font-black text-white shadow-lg shadow-slate-300/60 dark:shadow-black/30`}>
            {submission.name.slice(0, 1)}
          </div>
          <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[0.7rem] font-black text-white shadow-md ring-2 ring-white dark:ring-slate-900" aria-label={`리뷰 ${reviewCount.toLocaleString("ko-KR")}개`}>
            {reviewCount.toLocaleString("ko-KR")}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-black text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">{submission.name}</h3>
        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{submission.studentId}</p>
      </a>

      <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-3 dark:bg-slate-800/80">
        <p className="text-base font-black text-slate-900 dark:text-white">{getDisplayTitle(submission)}</p>
        <p className="mt-2 min-h-[3.75rem] overflow-hidden text-xs leading-5 text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-slate-400" title={submission.description || "아직 설명이 없습니다. 웹앱을 직접 열어 확인해 보세요."}>
          {submission.description || "아직 설명이 없습니다. 웹앱을 직접 열어 확인해 보세요."}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={submission.appUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-blue-600 px-3 py-2.5 text-center text-sm font-bold text-white transition hover:bg-blue-700">
          웹앱 열기
        </a>
        <button type="button" onClick={() => onOpenReviews(submission)} className="rounded-2xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          리뷰
        </button>
      </div>
    </article>
  );
}
