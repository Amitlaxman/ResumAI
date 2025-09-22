"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ResumePreviewProps {
  latexContent: string;
}

declare global {
  interface Window {
    latexjs: any;
  }
}

export default function ResumePreview({ latexContent }: ResumePreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.latexjs) {
        setError("latex.js library not loaded. Please refresh the page.");
        return;
    }
    
    if (!latexContent) {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      if(iframeRef.current) {
        iframeRef.current.src = "about:blank";
      }
      return;
    }

    const generatePdf = () => {
      setLoading(true);
      setError(null);
      try {
        // The latex.js library from the CDN uses this pattern
        const generator = window.latexjs.parse(latexContent);
        const blob = generator.toBlob('application/pdf');
        const url = URL.createObjectURL(blob);
        
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }

        setPdfUrl(url);

      } catch (e: any) {
        setError("Error rendering PDF: " + e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce PDF generation to avoid re-rendering on every keystroke
    const handler = setTimeout(generatePdf, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [latexContent]);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your rendered resume.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-muted/50 rounded-b-lg p-4 overflow-auto flex items-center justify-center">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {error && <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">{error}</div>}
        {pdfUrl && !error && (
            <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Resume Preview"></iframe>
        )}
        {!loading && !error && !latexContent && (
          <div className="text-center text-muted-foreground">
            <p>Start typing your LaTeX code to see a preview.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
