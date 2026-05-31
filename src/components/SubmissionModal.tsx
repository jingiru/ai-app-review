"use client";

import { FormEvent, useEffect, useState } from "react";
import type { SessionUser, Submission } from "@/lib/types";
import { validateAppUrl } from "@/lib/utils";
import { ModalShell } from "./LoginModal";

type SubmissionModalProps = {
  open: boolean;
  user: SessionUser | null;
  existingSubmission?: Submission;
  onClose: () => void;
  onRequireLogin: () => void;
  onSubmit: (values: { title: string; description: string; appUrl: string }) => Promise<void>;
};

export function SubmissionModal({ open, user, existingSubmission, onClose, onRequireLogin, onSubmit }: SubmissionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(existingSubmission?.title || "");
      setDescription(existingSubmission?.description || "");
      setAppUrl(existingSubmission?.appUrl || "");
      setMessage("");
      setSuccess("");
    }
  }, [existingSubmission, open]);

  if (!open) return null;

  if (!user) {
    return <ModalShell title="로그인이 필요합니다" onClose={onClose}>
      <p className="text-slate-600 dark:text-slate-300">웹앱 제출은 학번과 이름으로 로그인한 학생만 사용할 수 있습니다.</p>
      <button type="button" onClick={onRequireLogin} className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700">로그인하러 가기</button>
    </ModalShell>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setSuccess("");
    const urlMessage = validateAppUrl(appUrl);
    if (urlMessage && !urlMessage.includes("가능하면")) {
      setMessage(urlMessage);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title, description, appUrl });
      setSuccess("제출이 저장되었습니다. 같은 학생의 기존 제출물은 자동으로 수정됩니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "제출 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const httpsWarning = appUrl && validateAppUrl(appUrl).includes("가능하면") ? validateAppUrl(appUrl) : "";

  return <ModalShell title="내 웹앱 제출/수정" onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
        제출자: {user.name} ({user.studentId}, {user.classNo}반)
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">웹앱 링크 <span className="text-rose-500">*</span></label>
        <input value={appUrl} onChange={(event) => setAppUrl(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        {httpsWarning && <p className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-300">{httpsWarning}</p>}
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">제목</label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`${user.name}의 웹앱`} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">간단한 설명</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="어떤 기능이 있는 웹앱인지 짧게 소개해 주세요." className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </div>
      {message && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">{message}</p>}
      {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{success}</p>}
      <button disabled={loading} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "저장 중..." : "제출 저장"}
      </button>
    </form>
  </ModalShell>;
}
