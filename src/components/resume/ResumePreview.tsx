
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ResumePreviewProps {
  pdfDataUri?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ pdfDataUri }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pdfDoc: any = null;
    let isCancelled = false;
  
    const renderPdf = async () => {
      setLoading(true);
      setError(null);

      if (!pdfDataUri) {
        setError("No PDF data to display.");
        setLoading(false);
        return;
      }
      
      try {
        await (window as any).pdfjsLibReady.promise;
        const pdfjsLib = (window as any).pdfjsLib;

        const base64Data = pdfDataUri.split(',')[1];
        const pdfData = atob(base64Data);
        const uint8Array = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          uint8Array[i] = pdfData.charCodeAt(i);
        }
        
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        pdfDoc = await loadingTask.promise;

        if (isCancelled) return;

        const page = await pdfDoc.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 2 });
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
        
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to render PDF', err);
          setError(err.message || 'An error occurred while rendering the PDF.');
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      isCancelled = true;
      if (pdfDoc) {
        // pdfDoc.destroy();
      }
    };
  }, [pdfDataUri]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your rendered resume.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-muted/50 rounded-b-lg p-4 overflow-auto flex items-center justify-center">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {error && !loading && (
          <div className="text-center text-destructive">
            <AlertTriangle className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">Preview Failed</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        <canvas ref={canvasRef} className={`${loading || error ? 'hidden' : 'block'} max-w-full h-auto shadow-lg`} />
      </CardContent>
    </Card>
  );
};

export default ResumePreview;
