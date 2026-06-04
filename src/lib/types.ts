export type Student = {
  studentId: string;
  name: string;
  classNo: string;
};

export type Submission = {
  submissionId: string;
  studentId: string;
  name: string;
  classNo: string;
  title: string;
  description: string;
  appUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  reviewId: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  content: string;
  createdAt: string;
};

export type SessionUser = Student;

export type SortOption = "studentId" | "name" | "latest" | "reviews";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type DashboardData = {
  students: Student[];
  submissions: Submission[];
  reviews: Review[];
  isMock: boolean;
  message?: string;
};

export type SubmissionInput = {
  studentId: string;
  name: string;
  classNo: string;
  title: string;
  description: string;
  appUrl: string;
};

export type ReviewInput = {
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  content: string;
};
