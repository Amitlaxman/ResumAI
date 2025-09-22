
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Download, ArrowLeft } from 'lucide-react';
import type { Resume } from '@/types';
import { generatePdfFromLatex } from '@/ai/flows/generate-pdf-from-latex';
import { getResumeFromFirestore, updateResumeInFirestore } from '@/lib/firestore';


const ResumePreview = dynamic(() => import('@/components/resume/ResumePreview'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});


const resumeSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  latexContent: z.string().min(1, { message: 'LaTeX content cannot be empty.' }),
  pdfDataUri: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

export default function ResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  
  const id = params.id as string;

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: '',
      latexContent: '',
      pdfDataUri: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user && id) {
        const fetchResume = async () => {
            const fetchedResume = await getResumeFromFirestore(id);
            if (fetchedResume) {
                 const formattedResume = {
                    ...fetchedResume,
                    // @ts-ignore
                    createdAt: fetchedResume.createdAt.toDate ? fetchedResume.createdAt.toDate() : new Date(fetchedResume.createdAt)
                };
                // @ts-ignore
                setResume(formattedResume);
                form.reset({
                    title: formattedResume.title,
                    latexContent: formattedResume.latexContent,
                    pdfDataUri: formattedResume.pdfDataUri,
                });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load resume data.' });
                router.push('/dashboard');
            }
        };
        fetchResume();
    }
  }, [user, id, form, router, toast]);
  
  async function onSave(data: ResumeFormValues) {
    if (!user || !resume) return;
    setIsSaving(true);
    toast({ title: 'Saving resume...' });

    try {
      await updateResumeInFirestore(id, data);
      setResume(prev => prev ? { ...prev, ...data } : null);
      
      toast({ title: 'Resume Saved!', description: 'Your changes have been saved.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save resume.' });
    } finally {
      setIsSaving(false);
    }
  }

  const handleRecompile = async () => {
    setIsCompiling(true);
    toast({ title: 'Recompiling PDF...', description: 'Please wait.' });
    try {
        const latexContent = form.getValues('latexContent');
        const { pdfDataUri } = await generatePdfFromLatex({ latexContent });
        if (!pdfDataUri) {
          throw new Error("The compilation service returned an empty result.");
        }
        form.setValue('pdfDataUri', pdfDataUri);
        await updateResumeInFirestore(id, { pdfDataUri });
        setResume(prev => prev ? { ...prev, pdfDataUri } : null);
        toast({ title: 'PDF Recompiled!', description: 'The preview has been updated.' });
    } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Compilation Failed', description: error.message || 'Could not recompile the PDF.' });
    } finally {
        setIsCompiling(false);
    }
  }

  const handleDownloadPdf = () => {
    const pdfDataUri = form.getValues('pdfDataUri');
    if (pdfDataUri) {
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `${form.getValues('title').replace(/ /g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: "No PDF data available to download.",
      });
    }
  };

  const handleDownloadTex = () => {
    const content = form.getValues('latexContent');
    const title = form.getValues('title').replace(/ /g, '_').toLowerCase();
    const blob = new Blob([content], { type: 'text/x-latex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (loading || !user) {
    return <div className="container mx-auto p-4 md:p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!resume) {
    return <div className="container mx-auto p-4 md:p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input {...field} className="text-2xl font-bold font-headline border-0 shadow-none p-0 focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-x-2 flex-shrink-0">
               <Button type="button" variant="outline" onClick={handleDownloadTex}>
                <Download className="mr-2 h-4 w-4" /> Download .tex
              </Button>
              <Button type="button" variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
               <Button type="button" onClick={handleRecompile} disabled={isCompiling}>
                {isCompiling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Recompile PDF
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save All
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
            <FormField
              control={form.control}
              name="latexContent"
              render={({ field }) => (
                <FormItem className="flex flex-col h-full">
                  <FormLabel className="font-headline">LaTeX Code</FormLabel>
                  <FormControl className="flex-grow">
                    <Textarea
                      placeholder="Your generated LaTeX code will appear here."
                      className="h-full resize-none font-code text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <ResumePreview pdfDataUri={form.watch('pdfDataUri')} />

          </div>
        </form>
      </Form>
    </div>
  );
}
