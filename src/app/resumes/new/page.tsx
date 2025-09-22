
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { generateResumeFromProfile } from '@/ai/flows/generate-resume-from-profile';
import { generatePdfFromLatex } from '@/ai/flows/generate-pdf-from-latex';
import { getProfileFromFirestore, saveResumeToFirestore } from '@/lib/firestore';


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
import type { UserProfile, Resume } from '@/types';


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
      const userProfile = await getProfileFromFirestore(user.uid, user.email!, user.displayName!);

      const profileDataString = `
        Name: ${userProfile.name}
        Email: ${userProfile.email}
        Phone: ${userProfile.phone}
        Headline: ${userProfile.headline}
        Summary and Experience:
        ${userProfile.summary}
      `;
      
      // 1. Generate LaTeX content
      const { resumeContent } = await generateResumeFromProfile({
        profileData: profileDataString,
        jobDescription: data.jobDescription,
      });

      if (!resumeContent) {
        throw new Error("AI failed to generate resume content.");
      }
      
      // 2. Compile LaTeX to PDF
      const { pdfDataUri } = await generatePdfFromLatex({
          latexContent: resumeContent,
      });

      if (!pdfDataUri) {
          throw new Error("Failed to compile LaTeX to PDF.");
      }

      // 3. Save to our mock "firestore"
      const newResumeData = {
          title: data.title,
          jobDescription: data.jobDescription,
          latexContent: resumeContent,
          pdfDataUri: pdfDataUri,
      }
      // @ts-ignore
      const newResume = await saveResumeToFirestore(newResumeData, user.uid);

      toast({
        title: 'Resume Generated!',
        description: 'Redirecting you to the editor...',
      });
      
      router.push(`/resumes/${newResume.id}`);

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
