

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
  pdfDataUri?: string;
  createdAt: string; // Stored as ISO string
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
