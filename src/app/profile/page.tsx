
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { UserProfile } from '@/types';
import { getProfileFromFirestore, updateProfileInFirestore } from '@/lib/firestore';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  headline: z.string().min(5, { message: 'Headline must be at least 5 characters.' }),
  phone: z.string().optional(),
  summary: z.string().min(20, { message: 'Summary must be at least 20 characters.' }),
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
      summary: '',
    },
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

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Your Profile</CardTitle>
          <CardDescription>This information is used by the AI to generate your resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123-456-7890" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary & Experience</FormLabel>
                     <FormDescription>
                      Provide a detailed summary of your skills, experience, and accomplishments. This is the most important field for the AI.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Tell me about your professional background..."
                        className="resize-y min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
