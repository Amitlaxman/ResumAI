
'use server';
import { collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Resume } from '@/types';


// --- Profile Functions ---

const defaultProfileData: Omit<UserProfile, 'uid' | 'email' | 'name'> = {
    phone: '123-456-7890',
    headline: 'Experienced Professional',
    summary: 'A highly motivated and results-oriented individual with a passion for excellence. Skilled in various areas and always eager to learn and grow.',
};

export async function getProfileFromFirestore(uid: string, email: string, displayName: string): Promise<UserProfile> {
    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        return profileSnap.data() as UserProfile;
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
    return resumeList;
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

export async function saveResumeToFirestore(resume: Omit<Resume, 'id' | 'createdAt'>, userId: string): Promise<Resume> {
    const resumesCol = collection(db, 'resumes');
    const newResumeData = {
        ...resume,
        userId,
        createdAt: Timestamp.fromDate(new Date()),
    };
    const docRef = await addDoc(resumesCol, newResumeData);
    return {
        id: docRef.id,
        ...resume,
        createdAt: new Date().toISOString(), // Return as ISO string
    } as Resume;
}

export async function updateResumeInFirestore(id:string, data: Partial<Omit<Resume, 'id'>>): Promise<void> {
    const resumeRef = doc(db, 'resumes', id);
    await updateDoc(resumeRef, data);
}
