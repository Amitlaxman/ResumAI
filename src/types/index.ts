

export interface Link {
    label: string;
    url: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  headline: string;
  links: Link[];
  skills: string; // text blob
  experience: string; // text blob
  education: string; // text blob
  projects: string; // text blob
  extracurriculars: string; // text blob
  honorsAndAwards: string; // text blob
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
