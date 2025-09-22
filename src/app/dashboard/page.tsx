
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Send, Loader2, PlusCircle, FileText, Download } from 'lucide-react';
import type { Message, UserProfile } from '@/types';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import { getProfileFromFirestore, saveResumeToFirestore, getResumesFromFirestore } from '@/lib/firestore';
import type { Resume } from '@/types';


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      if (user) {
          setMessages([
              { role: 'assistant', content: `Hello ${user.displayName || 'User'}! I'm your AI career assistant. You can tell me about your skills and experience, and I'll keep your profile updated. When you're ready, just paste a job description and I'll craft a resume for you.` }
          ]);
          fetchData();
      }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    if (user) {
      const [userResumes, userProfile] = await Promise.all([
        getResumesFromFirestore(user.uid),
        getProfileFromFirestore(user.uid, user.email!, user.displayName!)
      ]);
      setResumes(userResumes);
      setProfile(userProfile);
    }
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !profile) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
        // Pass the full profile object, stringified, to the AI.
        const profileWithUid = { ...profile, uid: user.uid };
        const profileString = JSON.stringify(profileWithUid, null, 2);
        
        const history = messages.map(m => ({role: m.role, content: m.content}));

        const response = await chat({
            history,
            prompt: userMessage.content,
            profile: profileString,
        });

        // After the chat, always refetch the data to get the latest profile and resumes
        await fetchData();

        if (response.resumeContent) {
            // It's a resume generation response
            toast({ title: 'Resume Generated!', description: 'Saving and redirecting to editor...' });
             const newResumeData = {
                title: response.title || 'Untitled Resume',
                jobDescription: response.jobDescription || 'From chatbot session',
                latexContent: response.resumeContent,
            }
            const newResume = await saveResumeToFirestore(newResumeData, user.uid);
            router.push(`/resumes/${newResume.id}`);

        } else {
             // It's a regular chat response
            setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
        }

    } catch (error: any) {
        console.error("Chat error:", error);
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: error.message || 'Failed to get a response from the AI.',
        });
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
        setIsGenerating(false);
    }
  };

  if (loading || !user) {
    return <div className="container mx-auto p-4 md:p-8"><p>Loading...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8">
        {/* Chat Panel */}
        <div className="md:col-span-2 flex flex-col bg-card rounded-lg shadow-lg h-[calc(100vh-12rem)]">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">AI Career Assistant</CardTitle>
                <CardDescription>Chat with the AI to build your profile and generate resumes.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && <AvatarIcon className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarIcon>}
                        <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                         {msg.role === 'user' && <AvatarIcon><User className="h-5 w-5"/></AvatarIcon>}
                    </div>
                ))}
                {isGenerating && (
                     <div className="flex items-start gap-3">
                         <AvatarIcon className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarIcon>
                         <div className="rounded-lg px-4 py-2 bg-muted flex items-center space-x-2">
                             <Loader2 className="h-5 w-5 animate-spin"/>
                             <p className="text-sm">Thinking...</p>
                         </div>
                     </div>
                )}
                 <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Paste a job description or chat with the assistant..."
                        className="flex-1 resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <Button type="submit" size="icon" disabled={isGenerating}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </div>

        {/* Resumes Panel */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Resumes</CardTitle>
                     <CardDescription>View your generated resumes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {resumes.length > 0 ? (
                        <div className="space-y-4">
                            {resumes.map(resume => (
                                <Link href={`/resumes/${resume.id}`} key={resume.id} className="block p-4 rounded-lg hover:bg-muted transition-colors">
                                    <h3 className="font-semibold">{resume.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{resume.jobDescription}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created on {new Date(resume.createdAt).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                             <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                             <h3 className="mt-4 text-lg font-medium">No Resumes Found</h3>
                             <p className="mt-1 text-sm text-muted-foreground">
                                 Generate one using the chat!
                             </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

const AvatarIcon = ({ className, children }: { className?: string, children: React.ReactNode }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${className || 'bg-muted'}`}>
        {children}
    </div>
);
