
'use server';
import type { UserProfile, Resume } from '@/types';

// This is a mock database implementation using session storage to simulate Firestore.
// In a real application, you would replace this with actual calls to the Firestore SDK.

const MOCK_PROFILES_KEY = 'mock_profiles';
const MOCK_RESUMES_KEY = 'mock_resumes';

function getMockData<T>(key: string): Record<string, T> {
    if (typeof window === 'undefined') return {};
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

function setMockData<T>(key: string, data: Record<string, T>) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, JSON.stringify(data));
}

// --- Profile Functions ---

const defaultProfile: Omit<UserProfile, 'uid' | 'email'> = {
    name: 'John Doe',
    phone: '123-456-7890',
    headline: 'Experienced Software Developer',
    summary: 'A highly motivated and results-oriented software developer with over 5 years of experience in building and maintaining web applications. Proficient in JavaScript, React, and Node.js. Passionate about creating clean, efficient, and user-friendly code.',
};

export async function getProfileFromFirestore(uid: string, email: string, displayName: string): Promise<UserProfile> {
    const profiles = getMockData<UserProfile>(MOCK_PROFILES_KEY);
    if (profiles[uid]) {
        return profiles[uid];
    }
    // Create a default profile if one doesn't exist
    const newProfile: UserProfile = {
        uid,
        email,
        name: displayName || defaultProfile.name,
        ...defaultProfile,
    };
    await updateProfileInFirestore(uid, newProfile);
    return newProfile;
}

export async function updateProfileInFirestore(uid: string, data: Partial<UserProfile>): Promise<void> {
    const profiles = getMockData<UserProfile>(MOCK_PROFILES_KEY);
    profiles[uid] = { ...profiles[uid], ...data, uid };
    setMockData(MOCK_PROFILES_KEY, profiles);
}


// --- Resume Functions ---

const mockResumes: Omit<Resume, 'id' | 'userId' | 'createdAt'>[] = [
  {
    title: 'Software Engineer at TechCorp',
    jobDescription: 'Seeking a skilled software engineer...',
    latexContent: `\\documentclass{article}
\\begin{document}
Software Engineer resume for TechCorp.
\\end{document}`,
    pdfDataUri: '',
  },
  {
    title: 'Product Manager at Innovate Inc.',
    jobDescription: 'Lead product development...',
    latexContent: `\\documentclass{article}
\\begin{document}
Product Manager resume for Innovate Inc.
\\end{document}`,
    pdfDataUri: '',
  },
];


async function initializeUserResumes(userId: string) {
    const allResumes = getMockData<Resume>(MOCK_RESUMES_KEY);
     // Check if user already has resumes to avoid re-adding them
    const userResumesExist = Object.values(allResumes).some(resume => resume.userId === userId);

    if (!userResumesExist) {
        mockResumes.forEach((resumeData, index) => {
            const newId = `${userId}-mock-${index + 1}`;
            if (!allResumes[newId]) { // Add only if it doesn't exist
                allResumes[newId] = {
                    ...resumeData,
                    id: newId,
                    userId: userId,
                    // @ts-ignore
                    createdAt: { toDate: () => new Date() }, // Mock Timestamp
                };
            }
        });
        setMockData(MOCK_RESUMES_KEY, allResumes);
    }
}


export async function getResumesFromFirestore(userId: string): Promise<Resume[]> {
    await initializeUserResumes(userId);
    const resumes = getMockData<Resume>(MOCK_RESUMES_KEY);
    return Object.values(resumes).filter(r => r.userId === userId);
}

export async function getResumeFromFirestore(id: string): Promise<Resume | null> {
    const resumes = getMockData<Resume>(MOCK_RESUMES_KEY);
    return resumes[id] || null;
}

export async function saveResumeToFirestore(resume: Omit<Resume, 'id' | 'createdAt'>, userId: string): Promise<Resume> {
    const resumes = getMockData<Resume>(MOCK_RESUMES_KEY);
    const newId = new Date().getTime().toString();
    const newResume: Resume = {
        ...resume,
        id: newId,
        userId: userId,
        // @ts-ignore
        createdAt: { toDate: () => new Date() }, // Mock Timestamp
    };
    resumes[newId] = newResume;
    setMockData(MOCK_RESUMES_KEY, resumes);
    return newResume;
}

export async function updateResumeInFirestore(id: string, data: Partial<Resume>): Promise<void> {
    const resumes = getMockData<Resume>(MOCK_RESUMES_KEY);
    if (resumes[id]) {
        resumes[id] = { ...resumes[id], ...data };
        setMockData(MOCK_RESUMES_KEY, resumes);
    } else {
        throw new Error("Resume not found");
    }
}
