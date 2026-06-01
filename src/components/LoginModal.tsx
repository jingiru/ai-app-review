"use client";

import { FormEvent, ReactNode, useState } from "react";
import { isValidStudentId } from "@/lib/utils";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onLogin: (studentId: string, name: string) => Promise<void>;
};

export function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!isValidStudentId(studentId)) {
      setMessage("학번은 4자리 숫자로 입력해 주세요.");
      return;
    }
    if (!name.trim()) {
      setMessage("이름을 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      await onLogin(studentId.trim(), name.trim());
      setStudentId("");
      setName("");
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return <ModalShell title="학번과 이름으로 로그인" onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">학번</label>
        <input value={studentId} onChange={(event) => setStudentId(event.target.value)} inputMode="numeric" maxLength={4} placeholder="예: 2403" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">이름</label>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 홍길동" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </div>
      {message && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">{message}</p>}
      <button disabled={loading} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "로그인 확인 중..." : "로그인"}
      </button>
    </form>
  </ModalShell>;
}

type ModalShellProps = { title: string; onClose: () => void; children: ReactNode };
export function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-900 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
