"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { generateResumeFromProfile } from '@/ai/flows/generate-resume-from-profile';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';

// Mock server action to avoid actual DB write in this step
async function generateAndSaveResumeAction(payload: {
  profileData: string;
  jobDescription: string;
  title: string;
}): Promise<{ resumeId: string; }> {
  console.log("Generating resume for title:", payload.title);
  
  const { resumeContent } = await generateResumeFromProfile({
    profileData: payload.profileData,
    jobDescription: payload.jobDescription,
  });
  
  // In a real app, you would save this to Firestore and get a real ID.
  // The resume content would be saved in a new document.
  // For now, we just return a mock ID.
  console.log("Generated LaTeX content:", resumeContent.substring(0, 100) + '...');
  const mockResumeId = new Date().getTime().toString();
  
  // You would also want to store the resume content somewhere the next page can access it
  // e.g. sessionStorage, or by actually saving to DB and fetching on the next page.
  // For this demo, we'll use sessionStorage.
  if (typeof window !== 'undefined') {
    const newResume = {
      id: mockResumeId,
      title: payload.title,
      jobDescription: payload.jobDescription,
      latexContent: resumeContent,
      createdAt: new Date(),
    }
    sessionStorage.setItem(`resume-${mockResumeId}`, JSON.stringify(newResume));
  }
  
  return { resumeId: mockResumeId };
}

const newResumeSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters.' }),
});

type NewResumeFormValues = z.infer<typeof newResumeSchema>;

export default function NewResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewResumeFormValues>({
    resolver: zodResolver(newResumeSchema),
    defaultValues: {
      title: '',
      jobDescription: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  async function onSubmit(data: NewResumeFormValues) {
    if (!user) return;
    setIsSubmitting(true);
    toast({ title: 'Generating your resume...', description: 'The AI is hard at work. This may take a moment.' });
    
    try {
      // TODO: Replace with actual profile fetch from Firestore
      const mockProfile: Omit<UserProfile, 'uid' | 'email'> = {
        name: user.displayName || 'John Doe',
        phone: '123-456-7890',
        headline: 'Experienced Software Developer',
        summary: 'A highly motivated and results-oriented software developer with over 5 years of experience in building and maintaining web applications. Proficient in JavaScript, React, and Node.js. Passionate about creating clean, efficient, and user-friendly code.',
      };

      const profileDataString = `
        Name: ${mockProfile.name}
        Phone: ${mockProfile.phone}
        Headline: ${mockProfile.headline}
        
        Summary and Experience:
        ${mockProfile.summary}
      `;
      
      const { resumeId } = await generateAndSaveResumeAction({
        profileData: profileDataString,
        jobDescription: data.jobDescription,
        title: data.title,
      });

      toast({
        title: 'Resume Generated!',
        description: 'Redirecting you to the editor...',
      });
      
      router.push(`/resumes/${resumeId}`);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI could not generate a resume. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading || !user) {
    return <div className="container mx-auto p-4 md:p-8"><p>Loading...</p></div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create a New Resume</CardTitle>
          <CardDescription>Provide a title for your resume and the job description you're applying for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer at Google" {...field} />
                    </FormControl>
                    <FormDescription>A title to help you identify this resume later.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full job description here..."
                        className="min-h-[250px] font-code"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The AI will use this to tailor your resume's content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Resume
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
