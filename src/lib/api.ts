import { mockReviews, mockStudents, mockSubmissions } from "./mockData";
import type { ApiResponse, DashboardData, Review, ReviewInput, Student, Submission, SubmissionInput } from "./types";
import { createLocalId, getClassNoFromStudentId } from "./utils";

const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_API_URL?.trim();
const LOCAL_SUBMISSIONS_KEY = "ai-app-review-local-submissions";
const LOCAL_REVIEWS_KEY = "ai-app-review-local-reviews";

type Action = "getStudents" | "login" | "getSubmissions" | "upsertSubmission" | "getReviews" | "addReview";

async function callApi<T>(action: Action, payload: Record<string, unknown> = {}): Promise<T> {
  if (!API_URL) throw new Error("Apps Script API URL이 설정되지 않았습니다.");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!response.ok) throw new Error(`API 응답 오류: ${response.status}`);

  const result = (await response.json()) as ApiResponse<T>;
  if (!result.success) throw new Error(result.message || "요청을 처리하지 못했습니다.");
  return result.data as T;
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getMockDashboard(): DashboardData {
  return {
    submissions: readLocal(LOCAL_SUBMISSIONS_KEY, mockSubmissions),
    reviews: readLocal(LOCAL_REVIEWS_KEY, mockReviews),
    isMock: true,
    message: "현재 예시 데이터로 표시 중입니다. Apps Script API URL을 연결하면 Google Sheets 데이터가 표시됩니다.",
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const [submissions, reviews] = await Promise.all([
      callApi<Submission[]>("getSubmissions"),
      callApi<Review[]>("getReviews"),
    ]);
    return { submissions, reviews, isMock: false };
  } catch (error) {
    const fallback = getMockDashboard();
    return {
      ...fallback,
      message: error instanceof Error ? `API 연결 실패: ${error.message} 현재 예시 데이터로 표시 중입니다.` : fallback.message,
    };
  }
}

export async function loginStudent(studentId: string, name: string): Promise<{ user: Student; isMock: boolean }> {
  const trimmedName = name.trim();
  if (API_URL) {
    try {
      const user = await callApi<Student>("login", { studentId, name: trimmedName });
      return { user, isMock: false };
    } catch (error) {
      const matched = mockStudents.find((student) => student.studentId === studentId && student.name === trimmedName);
      if (matched) return { user: matched, isMock: true };
      throw error;
    }
  }

  const matched = mockStudents.find((student) => student.studentId === studentId && student.name === trimmedName);
  if (!matched) throw new Error("등록된 예시 학생 정보와 일치하지 않습니다. 예: 2403 / 홍길동");
  return { user: matched, isMock: true };
}

export async function upsertSubmission(input: SubmissionInput, useMock: boolean): Promise<Submission> {
  if (API_URL && !useMock) return callApi<Submission>("upsertSubmission", input);

  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });
  const submissions = readLocal(LOCAL_SUBMISSIONS_KEY, mockSubmissions);
  const existingIndex = submissions.findIndex((submission) => submission.studentId === input.studentId);
  const nextSubmission: Submission = {
    submissionId: existingIndex >= 0 ? submissions[existingIndex].submissionId : createLocalId("sub"),
    studentId: input.studentId,
    name: input.name.trim(),
    classNo: input.classNo || getClassNoFromStudentId(input.studentId),
    title: input.title.trim(),
    description: input.description.trim(),
    appUrl: input.appUrl.trim(),
    createdAt: existingIndex >= 0 ? submissions[existingIndex].createdAt : now,
    updatedAt: now,
  };

  const updated = existingIndex >= 0 ? submissions.map((item, index) => (index === existingIndex ? nextSubmission : item)) : [nextSubmission, ...submissions];
  writeLocal(LOCAL_SUBMISSIONS_KEY, updated);
  return nextSubmission;
}

export async function addReview(input: ReviewInput, useMock: boolean): Promise<Review> {
  if (API_URL && !useMock) return callApi<Review>("addReview", input);

  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });
  const review: Review = {
    reviewId: createLocalId("review"),
    submissionId: input.submissionId,
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName.trim(),
    content: input.content.trim(),
    createdAt: now,
  };
  const reviews = readLocal(LOCAL_REVIEWS_KEY, mockReviews);
  writeLocal(LOCAL_REVIEWS_KEY, [review, ...reviews]);
  return review;
}
