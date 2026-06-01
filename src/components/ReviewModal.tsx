"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Review, SessionUser, Submission } from "@/lib/types";
import { MAX_REVIEW_LENGTH, getDisplayTitle } from "@/lib/utils";
import { ModalShell } from "./LoginModal";

type ReviewModalProps = {
  submission: Submission | null;
  reviews: Review[];
  user: SessionUser | null;
  onClose: () => void;
  onRequireLogin: () => void;
  onAddReview: (submissionId: string, content: string) => Promise<void>;
};

export function ReviewModal({ submission, reviews, user, onClose, onRequireLogin, onAddReview }: ReviewModalProps) {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submissionReviews = useMemo(
    () => reviews.filter((review) => review.submissionId === submission?.submissionId),
    [reviews, submission?.submissionId],
  );

  if (!submission) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setSuccess("");

    if (!user) {
      setMessage("리뷰 작성은 로그인한 학생만 가능합니다.");
      return;
    }
    if (!content.trim()) {
      setMessage("댓글 내용을 입력해 주세요.");
      return;
    }
    if (content.trim().length > MAX_REVIEW_LENGTH) {
      setMessage(`댓글은 ${MAX_REVIEW_LENGTH}자 이내로 작성해 주세요.`);
      return;
    }

    setLoading(true);
    try {
      await onAddReview(submission.submissionId, content.trim());
      setContent("");
      setSuccess("리뷰가 등록되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "리뷰 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return <ModalShell title="리뷰 보기/남기기" onClose={onClose}>
    <div className="mb-5 rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-sm font-bold text-blue-600 dark:text-blue-300">{submission.name} · {submission.studentId} · {submission.classNo}반</p>
      <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{getDisplayTitle(submission)}</h3>
      <a href={submission.appUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 ring-1 ring-slate-200 hover:text-blue-600 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
        웹앱 새 탭에서 열기 ↗
      </a>
    </div>

    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
      {submissionReviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">아직 등록된 리뷰가 없습니다. 첫 기능 개선 아이디어를 남겨 보세요.</p>
      ) : submissionReviews.map((review) => (
        <div key={review.reviewId} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-slate-900 dark:text-white">{review.reviewerName} <span className="text-sm font-bold text-slate-400">({review.reviewerId})</span></p>
            <p className="text-xs font-bold text-slate-400">{review.createdAt}</p>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{review.content}</p>
        </div>
      ))}
    </div>

    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      {user ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{user.name}({user.studentId})로 작성합니다.</div>
      ) : (
        <button type="button" onClick={onRequireLogin} className="w-full rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-900">로그인하고 리뷰 작성하기</button>
      )}
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={MAX_REVIEW_LENGTH}
        rows={4}
        placeholder="친구의 웹앱을 사용해 보고, 추가되면 좋을 기능이나 불편했던 점을 적어주세요."
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900"
        disabled={!user}
      />
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-400">
        <span>{content.length}/{MAX_REVIEW_LENGTH}자</span>
      </div>
      {message && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">{message}</p>}
      {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{success}</p>}
      <button disabled={!user || loading} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "등록 중..." : "리뷰 등록"}
      </button>
    </form>
  </ModalShell>;
}
