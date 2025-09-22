"use client";

import React, { forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

interface ResumePreviewProps {
  latexContent: string;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ latexContent }, ref) => {
  return (
    <Card className="h-full flex flex-col" ref={ref}>
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your rendered resume.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-muted/50 rounded-b-lg p-4 overflow-auto">
        <div className="bg-white p-8 shadow-lg">
            <Latex>{latexContent}</Latex>
        </div>
      </CardContent>
    </Card>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
