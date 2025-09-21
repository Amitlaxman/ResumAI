import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  jobDescription: string;
  latexContent: string;
  createdAt: Timestamp;
}
