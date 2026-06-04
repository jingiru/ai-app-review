"use client";

import { useEffect, useMemo, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";
import { LoginModal } from "@/components/LoginModal";
import { MissingSubmissionsModal } from "@/components/MissingSubmissionsModal";
import { ReviewModal } from "@/components/ReviewModal";
import { SubmissionModal } from "@/components/SubmissionModal";
import { addReview, fetchDashboardData, loginStudent, upsertSubmission } from "@/lib/api";
import type { Review, SessionUser, SortOption, Student, Submission } from "@/lib/types";
import { getClassNoFromStudentId, isUsableUrl, SESSION_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/utils";

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("studentId");
  const [darkMode, setDarkMode] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Submission | null>(null);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedUser) setUser(JSON.parse(savedUser) as SessionUser);
    if (savedTheme === "dark") setDarkMode(true);

    fetchDashboardData().then((data) => {
      setStudents(data.students);
      setSubmissions(data.submissions);
      setReviews(data.reviews);
      setIsMock(data.isMock);
      setNotice(data.message || "");
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  const existingSubmission = useMemo(
    () => submissions.find((submission) => submission.studentId === user?.studentId),
    [submissions, user?.studentId],
  );

  const handleLogin = async (studentId: string, name: string) => {
    const result = await loginStudent(studentId, name);
    const normalizedUser = { ...result.user, classNo: result.user.classNo || getClassNoFromStudentId(result.user.studentId) };
    setUser(normalizedUser);
    setIsMock((current) => current || result.isMock);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalizedUser));
    if (result.isMock) setNotice("현재 예시 학생 데이터로 로그인했습니다. Apps Script 연결 후에는 students 시트 기준으로 검증됩니다.");
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const handleSubmission = async (values: { title: string; description: string; appUrl: string }) => {
    if (!user) throw new Error("로그인이 필요합니다.");
    if (!isUsableUrl(values.appUrl)) throw new Error("올바른 URL 형식이 아닙니다. 예: https://example.com");

    const saved = await upsertSubmission({ ...values, studentId: user.studentId, name: user.name, classNo: user.classNo }, isMock);
    setSubmissions((current) => {
      const exists = current.some((submission) => submission.studentId === saved.studentId);
      return exists ? current.map((submission) => (submission.studentId === saved.studentId ? saved : submission)) : [saved, ...current];
    });
    if (isMock) setNotice("제출 내용이 이 브라우저의 예시 데이터에 저장되었습니다. 실제 저장은 Apps Script 연결 후 Google Sheets에 반영됩니다.");
  };

  const handleAddReview = async (submissionId: string, content: string) => {
    if (!user) throw new Error("로그인이 필요합니다.");
    const saved = await addReview({ submissionId, content, reviewerId: user.studentId, reviewerName: user.name }, isMock);
    setReviews((current) => [saved, ...current]);
    if (isMock) setNotice("리뷰가 이 브라우저의 예시 데이터에 저장되었습니다. 실제 저장은 Apps Script 연결 후 Google Sheets에 반영됩니다.");
  };

  const openLoginFromModal = () => {
    setSubmissionOpen(false);
    setReviewTarget(null);
    setLoginOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-slate-950 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <Header
          user={user}
          search={search}
          sortBy={sortBy}
          darkMode={darkMode}
          onSearchChange={setSearch}
          onSortChange={setSortBy}
          onToggleDarkMode={() => setDarkMode((value) => !value)}
          onOpenLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
          onOpenSubmission={() => setSubmissionOpen(true)}
        />

        {notice && (
          <div className="mt-5 rounded-3xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-900">
            {notice}
          </div>
        )}

        <Dashboard students={students} submissions={submissions} reviews={reviews} loading={loading} search={search} sortBy={sortBy} onOpenReviews={setReviewTarget} onOpenMissingSubmissions={() => setMissingOpen(true)} />
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
      <SubmissionModal open={submissionOpen} user={user} existingSubmission={existingSubmission} onClose={() => setSubmissionOpen(false)} onRequireLogin={openLoginFromModal} onSubmit={handleSubmission} />
      <MissingSubmissionsModal open={missingOpen} students={students} submissions={submissions} onClose={() => setMissingOpen(false)} />
      <ReviewModal submission={reviewTarget} reviews={reviews} user={user} onClose={() => setReviewTarget(null)} onRequireLogin={openLoginFromModal} onAddReview={handleAddReview} />
    </main>
  );
}
