
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Bot, MessageSquare, Edit } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare className="h-10 w-10 text-primary" />,
    title: 'Conversational Profile Building',
    description: 'Simply chat with our AI assistant. It learns about you and updates your professional profile as you talk.',
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Generation',
    description: 'Paste a job description and our AI will craft a tailored, high-impact resume in seconds, based on your profile.',
  },
  {
    icon: <Edit className="h-10 w-10 text-primary" />,
    title: 'Edit & Customize',
    description: 'Fine-tune your generated resume. You get full access to the LaTeX code for ultimate customization and download.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-card border-b">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-primary">
            ResumAI
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Craft the perfect resume for your dream job. Let our AI assistant tailor your experience to any role through conversation.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose ResumAI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="items-center">
                  {feature.icon}
                  <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="w-full py-20 md:py-24 bg-card border-t">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">Simple Steps to a Perfect Resume</h2>
            <ul className="space-y-6">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">1. Chat with the AI</h3>
                  <p className="text-muted-foreground">Talk to our AI assistant about your skills, work history, and professional goals to build your profile.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">2. Provide a Job Description</h3>
                  <p className="text-muted-foreground">Paste the description of the job you're applying for. The AI will analyze it for you.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">3. Generate & Download</h3>
                  <p className="text-muted-foreground">The AI will generate a tailored resume. Review, edit the LaTeX, and download your PDF file.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxyZXN1bWV8ZW58MHx8fHwxNzU4NzMyMjEzfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Resume chatbot interface"
              width={600}
              height={400}
              className="w-full h-auto"
              data-ai-hint="resume"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
