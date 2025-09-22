

"use client";

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";

interface ResumePreviewProps {
  latexContent: string;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ latexContent }, ref) => {
  const [loading, setLoading] = useState(true);

  // Use a separate ref for the content that will be downloaded as PDF
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We'll use a timeout to give KaTeX time to render.
    // A more robust solution might involve a callback from the Latex component
    // if it provided one.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Give it a second to render.

    return () => clearTimeout(timer);
  }, [latexContent]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your rendered resume.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-muted/50 rounded-b-lg p-4 overflow-auto">
        {loading && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        <div ref={ref} className={loading ? 'hidden' : ''}>
          <div className="bg-white p-8 shadow-lg" ref={pdfContentRef}>
            <Latex>{latexContent}</Latex>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;

