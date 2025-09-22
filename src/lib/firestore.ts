
'use server';
import { collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Resume } from '@/types';


// --- Profile Functions ---

const defaultProfileData: Omit<UserProfile, 'uid' | 'email' | 'name'> = {
    phone: '123-456-7890',
    headline: 'Experienced Professional Ready for a New Challenge',
    links: [
        { label: 'Portfolio', url: 'your-portfolio.com' },
        { label: 'LinkedIn', url: 'linkedin.com/in/your-username' },
        { label: 'GitHub', url: 'github.com/your-username' },
    ],
    skills: 'TypeScript, React, Next.js, Firebase, Genkit, Tailwind CSS',
    experience: '5 years of experience developing and shipping high-quality software solutions. Proven ability to work in fast-paced, collaborative environments.',
    education: 'B.S. in Computer Science from a reputable university.',
    projects: 'Developed a full-stack web application for managing personal tasks. Created a mobile app for tracking fitness goals.',
    extracurriculars: 'Volunteer at a local coding bootcamp, member of a hiking club.',
    honorsAndAwards: 'Dean\'s List, Employee of the Month.',
};


export async function getProfileFromFirestore(uid: string, email: string, displayName: string): Promise<UserProfile> {
    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        const data = profileSnap.data();
        // Ensure all fields from the latest UserProfile interface are present
        return {
            ...defaultProfileData,
            ...data,
            uid,
            email,
            name: data.name || displayName,
        } as UserProfile;
    } else {
        // Create a default profile if one doesn't exist
        const newProfile: UserProfile = {
            uid,
            email,
            name: displayName || 'New User',
            ...defaultProfileData,
        };
        await setDoc(profileRef, newProfile);
        return newProfile;
    }
}

export async function updateProfileInFirestore(uid: string, data: Partial<UserProfile>): Promise<void> {
    const profileRef = doc(db, 'profiles', uid);
    await setDoc(profileRef, data, { merge: true });
}


// --- Resume Functions ---

export async function getResumesFromFirestore(userId: string): Promise<Resume[]> {
    const resumesCol = collection(db, 'resumes');
    const q = query(resumesCol, where('userId', '==', userId));
    const resumeSnapshot = await getDocs(q);
    const resumeList = resumeSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Resume;
    });
    return resumeList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getResumeFromFirestore(id: string): Promise<Resume | null> {
    const resumeRef = doc(db, 'resumes', id);
    const resumeSnap = await getDoc(resumeRef);
    if (!resumeSnap.exists()) {
        return null;
    }
    const data = resumeSnap.data();
    return {
        id: resumeSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as Resume;
}

export async function saveResumeToFirestore(resume: Omit<Resume, 'id' | 'createdAt' | 'userId'>, userId: string): Promise<Resume> {
    const resumesCol = collection(db, 'resumes');
    const newResumeData = {
        ...resume,
        userId,
        createdAt: Timestamp.fromDate(new Date()),
    };
    const docRef = await addDoc(resumesCol, newResumeData);
    return {
        id: docRef.id,
        userId,
        ...resume,
        createdAt: new Date().toISOString(),
    } as Resume;
}

export async function updateResumeInFirestore(id:string, data: Partial<Omit<Resume, 'id'>>): Promise<void> {
    const resumeRef = doc(db, 'resumes', id);
    await updateDoc(resumeRef, data);
}
