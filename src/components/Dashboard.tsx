"use client";

import { useMemo, useState } from "react";
import type { Review, SortOption, Student, Submission } from "@/lib/types";
import { getReviewCount, normalizeText, sortSubmissions } from "@/lib/utils";
import { ClassFilter } from "./ClassFilter";
import { EmptyState } from "./EmptyState";
import { SubmissionCard } from "./SubmissionCard";

type DashboardProps = {
  students: Student[];
  submissions: Submission[];
  reviews: Review[];
  loading: boolean;
  search: string;
  sortBy: SortOption;
  onOpenReviews: (submission: Submission) => void;
  onOpenMissingSubmissions: () => void;
};

export function Dashboard({ students, submissions, reviews, loading, search, sortBy, onOpenReviews, onOpenMissingSubmissions }: DashboardProps) {
  const [selectedClass, setSelectedClass] = useState("전체");

  const classes = useMemo(
    () => Array.from(new Set(submissions.map((submission) => submission.studentId.charAt(1) || submission.classNo).filter(Boolean))).sort((a, b) => Number(a) - Number(b)),
    [submissions],
  );

  const missingCount = useMemo(() => {
    const submittedStudentIds = new Set(submissions.map((submission) => submission.studentId));
    return students.filter((student) => !submittedStudentIds.has(student.studentId)).length;
  }, [students, submissions]);

  const filteredSubmissions = useMemo(() => {
    const keyword = normalizeText(search);
    const filtered = submissions.filter((submission) => {
      const classNo = submission.studentId.charAt(1) || submission.classNo;
      const matchesClass = selectedClass === "전체" || classNo === selectedClass;
      const searchable = normalizeText(`${submission.name} ${submission.studentId} ${submission.title}`);
      return matchesClass && (!keyword || searchable.includes(keyword));
    });
    return sortSubmissions(filtered, reviews, sortBy);
  }, [reviews, search, selectedClass, sortBy, submissions]);

  return (
    <section className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900/80 dark:ring-slate-800 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">반별 필터</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">학번의 둘째 자리 기준으로 반을 구분합니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenMissingSubmissions}
              className="rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-900 dark:hover:bg-rose-900"
            >
              미제출 {missingCount}명 보기
            </button>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              총 {filteredSubmissions.length}개 표시
            </div>
          </div>
        </div>
        <ClassFilter classes={classes} selectedClass={selectedClass} onSelect={setSelectedClass} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[1.75rem] bg-slate-200/80 dark:bg-slate-800" />)}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState title="아직 제출된 웹앱이 없습니다" description="학생들이 웹앱 링크를 제출하면 이곳에 카드로 표시됩니다." icon="🧑‍💻" />
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState title="검색 결과가 없습니다" description="검색어 또는 반 필터를 바꿔 다시 확인해 보세요." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard key={submission.submissionId} submission={submission} reviewCount={getReviewCount(reviews, submission.submissionId)} onOpenReviews={onOpenReviews} />
          ))}
        </div>
      )}
    </section>
  );
}
