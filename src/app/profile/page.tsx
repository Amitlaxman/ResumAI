"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  phone: z.string().optional(),
  headline: z.string().min(5, { message: 'Headline must be at least 5 characters.' }),
  summary: z.string().min(50, { message: 'Summary must be at least 50 characters.' }).max(1500),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      headline: '',
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
      // TODO: Replace with actual Firestore fetch
      // const fetchProfile = async () => {
      //   const userProfile = await getProfileFromFirestore(user.uid);
      //   if (userProfile) {
      //     setProfile(userProfile);
      //     form.reset(userProfile);
      //   } else {
      //     form.reset({ email: user.email || '', name: user.displayName || '' });
      //   }
      // };
      // fetchProfile();
      const mockProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: '123-456-7890',
        headline: 'Experienced Software Developer',
        summary: 'A highly motivated and results-oriented software developer with over 5 years of experience in building and maintaining web applications. Proficient in JavaScript, React, and Node.js. Passionate about creating clean, efficient, and user-friendly code.',
      };
      setProfile(mockProfile);
      form.reset(mockProfile);
    }
  }, [user, form]);
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSubmitting(true);
    toast({ title: 'Saving profile...', description: 'Please wait.' });

    try {
      // TODO: Replace with actual Firestore update
      // await updateProfileInFirestore(user.uid, data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: 'Profile Updated!',
        description: 'Your information has been saved successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Your Professional Profile</CardTitle>
          <CardDescription>This information will be used by the AI to generate your resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} readOnly disabled />
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
                        <Input placeholder="(123) 456-7890" {...field} />
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
                      <FormDescription>A short, catchy phrase that sums up your professional identity.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary / Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your skills, experience, and accomplishments. The more detail, the better the AI can tailor your resume."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include your work history, education, skills, and projects here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
