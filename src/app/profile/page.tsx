
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, PlusCircle } from 'lucide-react';
import type { UserProfile, Link } from '@/types';
import { getProfileFromFirestore, updateProfileInFirestore } from '@/lib/firestore';

const linkSchema = z.object({
  label: z.string().min(1, 'Label cannot be empty'),
  url: z.string().url('Must be a valid URL'),
});

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  headline: z.string().min(5, 'Headline must be at least 5 characters.'),
  phone: z.string().optional(),
  links: z.array(linkSchema).optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  projects: z.string().optional(),
  extracurriculars: z.string().optional(),
  honorsAndAwards: z.string().optional(),
});


type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      headline: '',
      phone: '',
      links: [],
      skills: '',
      experience: '',
      education: '',
      projects: '',
      extracurriculars: '',
      honorsAndAwards: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const profile = await getProfileFromFirestore(user.uid, user.email!, user.displayName!);
        form.reset(profile);
      };
      fetchProfile();
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSaving(true);
    toast({ title: 'Saving profile...' });

    try {
      await updateProfileInFirestore(user.uid, data);
      toast({ title: 'Profile Saved!', description: 'Your changes have been saved.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save profile.' });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="container mx-auto p-4 md:p-8"><p>Loading...</p></div>;
  }

  const renderTextareaField = (name: keyof ProfileFormValues, label: string, placeholder: string) => (
     <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea placeholder={placeholder} className="min-h-[120px] resize-y" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <CardHeader className="px-0">
          <CardTitle className="font-headline text-3xl">Your Professional Profile</CardTitle>
          <CardDescription>This information is used by the AI to generate your resumes. Keep it detailed and up-to-date.</CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="e.g., 123-456-7890" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="headline" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Professional Headline</FormLabel>
                        <FormControl><Input placeholder="e.g., Senior Software Engineer at Tech Corp" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
               <CardHeader><CardTitle>Links</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4">
                            <FormField control={form.control} name={`links.${index}.label`} render={({ field }) => (
                                <FormItem className="w-1/4">
                                    <FormLabel>Label</FormLabel>
                                    <FormControl><Input placeholder="Portfolio" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name={`links.${index}.url`} render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>URL</FormLabel>
                                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ label: '', url: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                    </Button>
               </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Professional Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {renderTextareaField("skills", "Skills", "List your technical and soft skills, separated by commas.")}
                    {renderTextareaField("experience", "Experience", "Describe your professional experience. Include roles, responsibilities, and key achievements.")}
                    {renderTextareaField("education", "Education", "Detail your educational background, including degrees, universities, and graduation dates.")}
                    {renderTextareaField("projects", "Projects", "Showcase your personal or professional projects. Briefly describe each one and your role.")}
                    {renderTextareaField("extracurriculars", "Extracurricular Activities", "Mention any relevant extracurricular activities or volunteer work.")}
                    {renderTextareaField("honorsAndAwards", "Honors and Awards", "List any honors, awards, or recognitions you have received.")}
                </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-4">
              <Button type="submit" disabled={isSaving} size="lg" className="shadow-lg">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
    </div>
  );
}
