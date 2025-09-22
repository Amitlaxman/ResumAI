
"use client";

import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';


interface ResumePreviewProps {
  latexContent?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ latexContent }) => {

  const sanitizedLatex = latexContent
    // Remove document setup commands
    ?.replace(/\\documentclass\[.*?\]{.*?}/gs, '')
    .replace(/\\usepackage{.*?}/gs, '')
    .replace(/\\begin{document}/gs, '')
    .replace(/\\end{document}/gs, '')
    .replace(/\\pagestyle{.*?}/gs, '')
    .replace(/\\newcounter{.*?}/gs, '')
    .replace(/\\hypersetup{.*?}/gs, '')
    .replace(/\\urlstyle{.*?}/gs, '')
    .replace(/\\raggedbottom/gs, '')
    .replace(/\\raggedright/gs, '')
    .replace(/\\setlength{.*?}{.*?}/gs, '')
    .replace(/\\newcommand{.*?}{.*?}/gs, '') // Remove command definitions
    .replace(/%.*?\n/g, '') // Remove comments

    // Replace structural commands with HTML-like tags for parsing
    .replace(/\\begin{center}([\s\S]*?)\\end{center}/gs, '<centerblock>$1</centerblock>')
    .replace(/\\resumeheader{(.*?)}/gs, '<h1>$1</h1>')
    .replace(/\\resumecontact{([\s\S]*?)}/gs, (match, content) => {
        const lines = content.replace(/\\\\/g, '').trim().split('$|$').map(s => s.trim());
        return `<p style="text-align: center; font-size: small;">${lines.join(' | ')}</p>`;
    })
    .replace(/\\section{(.*?)}/gs, '<h2>$1</h2><hr/>')
    .replace(/\\entry{(.*?)}{(.*?)}{([\s\S]*?)}{.*?}/gs, (match, left, right, body) => {
        const bullets = body.replace(/\\bullets{([\s\S]*?)}/gs, '<ul>$1</ul>')
                           .replace(/\\item/g, '<li>');
        return `<div style="margin-bottom: 8px;"><div style="display: flex; justify-content: space-between;"><b>${left}</b><span>${right}</span></div><div>${bullets}</div></div>`;
    })
     .replace(/\\entry{(.*?)}{(.*?)}\s*{\s*\\textbf{(.*?)}\s*}\s*{(.*?)}\s*\\vspace{.*?}\s*\\desc{(.*?)}/gs,
        '<div style="margin-bottom: 8px;"><div style="display: flex; justify-content: space-between;"><b>$1</b><span>$4</span></div><div><b>$3</b></div><div>$5</div></div>'
    )
    .replace(/\\singlelineentry{(.*?)}{([\s\S]*?)}/gs, '<div><div style="display: flex; justify-content: space-between;"><b>$1</b><span style="word-break: break-all;">$2</span></div></div>')
    .replace(/\\desc{(.*?)}/gs, '<div>$1</div>')
    .replace(/\\bullets{([\s\S]*?)}/gs, '<ul>$1</ul>')
    .replace(/\\item/g, '<li>')
    
    // Cleanup remaining formatting commands
    .replace(/\\hrule/g, '<hr />')
    .replace(/\\hfill/g, '')
    .replace(/\\textbf{(.*?)}/g, '<b>$1</b>')
    .replace(/\\bfseries/g, '')
    .replace(/\\scshape/g, '')
    .replace(/\\color{.*?}/g, '')
    .replace(/\\\\\[.*?\]/g, '<br/>')
    .replace(/\\vspace{.*?}/g, '')
    .replace(/\\\\/g, '<br/>');


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your resume. Note: This is not a PDF, but a web-based rendering of the LaTeX code.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow bg-white rounded-b-lg p-6 overflow-auto text-black">
        {latexContent ? (
           <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedLatex || '' }} />
        ) : (
          <div className="text-center text-gray-500">
            <AlertTriangle className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">No Content to Display</h3>
            <p className="mt-1 text-sm">The LaTeX content is empty.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumePreview;
