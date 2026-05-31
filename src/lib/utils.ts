import type { Review, Submission } from "./types";

export const SESSION_STORAGE_KEY = "ai-app-review-session";
export const THEME_STORAGE_KEY = "ai-app-review-theme";
export const MAX_REVIEW_LENGTH = 500;

export function getClassNoFromStudentId(studentId: string) {
  return studentId.trim().charAt(1) || "";
}

export function isValidStudentId(studentId: string) {
  return /^\d{4}$/.test(studentId.trim());
}

export function validateAppUrl(url: string) {
  const value = url.trim();
  if (!value) return "웹앱 링크를 입력해 주세요.";

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "http:// 또는 https://로 시작하는 URL을 입력해 주세요.";
    }
    if (parsed.protocol !== "https:") {
      return "가능하면 https://로 시작하는 안전한 링크를 사용해 주세요.";
    }
    return "";
  } catch {
    return "올바른 URL 형식이 아닙니다. 예: https://example.com";
  }
}

export function isUsableUrl(url: string) {
  const message = validateAppUrl(url);
  return !message || message.includes("가능하면");
}

export function getDisplayTitle(submission: Pick<Submission, "title" | "name">) {
  return submission.title?.trim() || `${submission.name}의 웹앱`;
}

export function formatReviewCount(count: number) {
  return `리뷰 ${count.toLocaleString("ko-KR")}개`;
}

export function getReviewCount(reviews: Review[], submissionId: string) {
  return reviews.filter((review) => review.submissionId === submissionId).length;
}

export function avatarGradient(seed: string) {
  const gradients = [
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-600",
    "from-violet-400 to-purple-600",
    "from-amber-300 to-orange-500",
    "from-rose-400 to-pink-600",
    "from-cyan-400 to-indigo-500",
    "from-lime-300 to-green-600",
    "from-fuchsia-400 to-violet-600",
  ];
  const total = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[total % gradients.length];
}

export function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

export function sortSubmissions(
  submissions: Submission[],
  reviews: Review[],
  sortBy: "studentId" | "name" | "latest" | "reviews",
) {
  return [...submissions].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name, "ko-KR");
    if (sortBy === "latest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === "reviews") return getReviewCount(reviews, b.submissionId) - getReviewCount(reviews, a.submissionId);
    return a.studentId.localeCompare(b.studentId, "ko-KR", { numeric: true });
  });
}

export function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
