import type { Submission } from "@/lib/types";
import { avatarGradient, formatReviewCount, getDisplayTitle } from "@/lib/utils";

type SubmissionCardProps = {
  submission: Submission;
  reviewCount: number;
  onOpenReviews: (submission: Submission) => void;
};

export function SubmissionCard({ submission, reviewCount, onOpenReviews }: SubmissionCardProps) {
  return (
    <article className="group rounded-[2rem] bg-white p-5 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:shadow-black/20 dark:ring-slate-800">
      <a href={submission.appUrl} target="_blank" rel="noopener noreferrer" className="block text-center" aria-label={`${submission.name} 웹앱 새 탭에서 열기`}>
        <div className={`mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(submission.studentId)} text-3xl font-black text-white shadow-lg shadow-slate-300/60 dark:shadow-black/30`}>
          {submission.name.slice(0, 1)}
        </div>
        <h3 className="mt-4 text-2xl font-black text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">{submission.name}</h3>
        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{submission.studentId} · {submission.classNo}반</p>
      </a>

      <div className="mt-5 rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/80">
        <p className="text-lg font-black text-slate-900 dark:text-white">{getDisplayTitle(submission)}</p>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {submission.description || "아직 설명이 없습니다. 웹앱을 직접 열어 확인해 보세요."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">{formatReviewCount(reviewCount)}</span>
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">수정 {submission.updatedAt || "정보 없음"}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <a href={submission.appUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700">
          웹앱 열기
        </a>
        <button type="button" onClick={() => onOpenReviews(submission)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          리뷰 보기/남기기
        </button>
      </div>
    </article>
  );
}
