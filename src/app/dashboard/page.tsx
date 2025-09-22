
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Resume } from '@/types';
import { getResumesFromFirestore } from '@/lib/firestore';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user) {
      const fetchResumes = async () => {
        const userResumes = await getResumesFromFirestore(user.uid);
        // Quick fix for createdAt type mismatch
        const formattedResumes = userResumes.map(r => ({
          ...r,
          createdAt: r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt as any)
        }));
        // @ts-ignore
        setResumes(formattedResumes);
      };
      fetchResumes();
    }
  }, [user]);

  if (loading || !user) {
    return <div className="container mx-auto p-4 md:p-8"><p>Loading...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user.displayName || 'User'}!</h1>
          <p className="text-muted-foreground">Manage your resumes or create a new one.</p>
        </div>
        <Button asChild>
          <Link href="/resumes/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Resume
          </Link>
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold font-headline mb-4">Your Resumes</h2>
        {resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="hover:text-primary">
                      <Link href={`/resumes/${resume.id}`}>{resume.title}</Link>
                    </CardTitle>
                    {/* @ts-ignore */}
                    <CardDescription>Created on {resume.createdAt.toLocaleDateString()}</CardDescription>
                  </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/resumes/${resume.id}`}><Edit className="mr-2 h-4 w-4"/>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => alert('Delete feature not implemented.')}>
                        <Trash2 className="mr-2 h-4 w-4"/>Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{resume.jobDescription}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" asChild className="w-full">
                    <Link href={`/resumes/${resume.id}`}>
                      <FileText className="mr-2 h-4 w-4" /> View Resume
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Resumes Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first AI-powered resume.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/resumes/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Resume
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
