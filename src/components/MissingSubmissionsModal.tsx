"use client";

import type { Student, Submission } from "@/lib/types";
import { getClassNoFromStudentId } from "@/lib/utils";
import { ModalShell } from "./LoginModal";

type MissingSubmissionsModalProps = {
  open: boolean;
  students: Student[];
  submissions: Submission[];
  onClose: () => void;
};

function getClassNo(student: Student) {
  return student.classNo || getClassNoFromStudentId(student.studentId);
}

export function MissingSubmissionsModal({ open, students, submissions, onClose }: MissingSubmissionsModalProps) {
  if (!open) return null;

  const submittedStudentIds = new Set(submissions.map((submission) => submission.studentId));
  const missingStudents = students
    .filter((student) => !submittedStudentIds.has(student.studentId))
    .sort((a, b) => a.studentId.localeCompare(b.studentId, "ko-KR", { numeric: true }));
  const classGroups = missingStudents.reduce<Record<string, Student[]>>((groups, student) => {
    const classNo = getClassNo(student) || "미지정";
    return { ...groups, [classNo]: [...(groups[classNo] || []), student] };
  }, {});
  const sortedClasses = Object.keys(classGroups).sort((a, b) => Number(a) - Number(b));

  return <ModalShell title="미제출 학생 확인" onClose={onClose}>
    <div className="space-y-5">
      <div className="rounded-3xl bg-blue-50 px-5 py-4 text-blue-900 ring-1 ring-blue-100 dark:bg-blue-950 dark:text-blue-100 dark:ring-blue-900">
        <p className="text-sm font-bold">students 시트에 등록된 학생 중 아직 웹앱을 제출하지 않은 학생입니다.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-black">
          <div className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-slate-900/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">전체</p>
            <p>{students.length}명</p>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-slate-900/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">제출</p>
            <p>{students.length - missingStudents.length}명</p>
          </div>
          <div className="rounded-2xl bg-white/80 px-3 py-2 dark:bg-slate-900/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">미제출</p>
            <p>{missingStudents.length}명</p>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-3xl bg-amber-50 px-5 py-6 text-sm font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-100">
          학생 명단을 불러오지 못했습니다. Google Sheets의 students 시트 또는 Apps Script 연결 상태를 확인해 주세요.
        </div>
      ) : missingStudents.length === 0 ? (
        <div className="rounded-3xl bg-emerald-50 px-5 py-6 text-center font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          🎉 모든 학생이 제출했습니다.
        </div>
      ) : (
        <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
          {sortedClasses.map((classNo) => (
            <div key={classNo} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-slate-950 dark:text-white">{classNo}반</h3>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600 dark:bg-rose-950 dark:text-rose-200">
                  {classGroups[classNo].length}명 미제출
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {classGroups[classNo].map((student) => (
                  <li key={student.studentId} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {student.studentId} · {student.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  </ModalShell>;
}
