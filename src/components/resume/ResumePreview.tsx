
"use client";

import { useEffect, useState } from 'react';
import latex from 'latex.js';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumePreviewProps {
  latexContent: string;
}

export default function ResumePreview({ latexContent }: ResumePreviewProps) {
  const [pdf, setPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    const generatePdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const generator = new (window as any).latexjs.default();
        const doc = generator.parse(latexContent, {
          macros: {},
        });
        const pdfBlob = await doc.render({
          format: 'pdf',
          output: 'blob',
        });
        setPdf(URL.createObjectURL(pdfBlob));
      } catch (e: any) {
        setError("Error rendering PDF: " + e.message);
        setPdf(null);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const handler = setTimeout(() => {
        if(latexContent) {
            generatePdf();
        }
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [latexContent]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your rendered resume.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-muted/50 rounded-b-lg p-4 overflow-auto flex items-center justify-center">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {error && <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">{error}</div>}
        {pdf && !error && (
           <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess} loading={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
             {Array.from(new Array(numPages || 0), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} />
              ))}
          </Document>
        )}
        {!pdf && !loading && !error && (
          <div className="text-center text-muted-foreground">
            <p>Start typing your LaTeX code to see a preview.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
