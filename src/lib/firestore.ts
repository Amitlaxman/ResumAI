
'use server';
import { collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Resume } from '@/types';


// --- Profile Functions ---

const emptyProfileData: Omit<UserProfile, 'uid' | 'email' | 'name'> = {
    phone: '',
    headline: '',
    links: [],
    skills: '',
    experience: '',
    education: '',
    projects: '',
    extracurriculars: '',
    honorsAndAwards: '',
};


export async function getProfileFromFirestore(uid: string, email: string, displayName: string): Promise<UserProfile> {
    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        const data = profileSnap.data();
        // Ensure all fields from the latest UserProfile interface are present
        return {
            ...emptyProfileData,
            ...data,
            uid,
            email,
            name: data.name || displayName,
        } as UserProfile;
    } else {
        // Create an empty profile if one doesn't exist
        const newProfile: UserProfile = {
            uid,
            email,
            name: displayName || 'New User',
            ...emptyProfileData,
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
