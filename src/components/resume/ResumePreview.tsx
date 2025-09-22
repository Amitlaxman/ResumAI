
"use client";

import React from 'react';
import 'katex/dist/katex.min.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';


interface ResumePreviewProps {
  latexContent?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ latexContent }) => {

  const sanitizedLatex = latexContent
    // Strip everything before \begin{document}
    ?.replace(/[\s\S]*?(?=\\begin{document})/i, '')
    // Remove document begin/end
    .replace(/\\begin{document}/gs, '')
    .replace(/\\end{document}/gs, '')
    // Remove comments
    .replace(/%.*?\n/g, '')
    // Remove other preamble-like commands that might be left
    .replace(/\\documentclass\[.*?\]{.*?}/gs, '')
    .replace(/\\usepackage{.*?}/gs, '')
    .replace(/\\pagestyle{.*?}/gs, '')
    .replace(/\\newcounter{.*?}/gs, '')
    .replace(/\\hypersetup{.*?}/gs, ' ')
    .replace(/\\urlstyle{.*?}/gs, '')
    .replace(/\\raggedbottom/gs, '')
    .replace(/\\raggedright/gs, '')
    .replace(/\\setlength{.*?}{.*?}/gs, '')
    .replace(/\\newcommand{[\s\S]*?}/gs, '')
    .replace(/\\ifx&#3&\\else/, '') // specific artifact cleanup

    // Replace structural commands with HTML-like tags for parsing
    .replace(/\\begin{center}([\s\S]*?)\\end{center}/gs, '<div style="text-align: center; margin-bottom: 1.5rem;">$1</div>')
    .replace(/\\resumeheader{(.*?)}/gs, '<h1 style="font-size: 2.5rem; font-weight: 700; color: #2d3748; margin-bottom: 0.25rem;">$1</h1>')
    .replace(/\\resumecontact{([\s\S]*?)}/gs, (match, content) => {
        const lines = content.replace(/\\\\/g, '').trim().split('$|$').map(s => s.trim());
        return `<p style="text-align: center; font-size: 0.9rem; color: #4a5568;">${lines.join(' | ')}</p>`;
    })
    .replace(/\\section{(.*?)}/gs, '<h2 style="font-size: 1.2rem; font-weight: 700; text-transform: uppercase; color: #2d3748; border-bottom: 2px solid #2d3748; padding-bottom: 4px; margin-top: 1.5rem; margin-bottom: 1rem;">$1</h2>')
    .replace(/\\entry{(.*?)}{(.*?)}{([\s\S]*?)}{.*?}/gs, (match, left, right, body) => {
        const bullets = body.replace(/\\bullets{([\s\S]*?)}/gs, '<ul style="margin-left: 20px; padding-left: 0; list-style-type: disc; margin-top: 8px;">$1</ul>')
                           .replace(/\\item/g, '<li style="margin-bottom: 6px;">');
        return `<div style="margin-bottom: 1.25rem;"><div style="display: flex; justify-content: space-between; font-weight: 600;"><span>${left}</span><span>${right}</span></div><div>${bullets}</div></div>`;
    })
     .replace(/\\entry{(.*?)}{(.*?)}\s*{\s*\\textbf{(.*?)}\s*}\s*{(.*?)}\s*\\vspace{.*?}\s*\\desc{(.*?)}/gs,
        '<div style="margin-bottom: 1.25rem;"><div style="display: flex; justify-content: space-between; font-weight: 600;"><span>$1</span><span>$4</span></div><div style="font-style: italic; color: #4a5568;">$3</div><div style="margin-top: 4px; padding-left: 20px;">$5</div></div>'
    )
    .replace(/\\singlelineentry{(.*?)}{([\s\S]*?)}/gs, '<div><div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;"><span style="font-weight: 600;">$1</span><span style="word-break: break-all; text-align: right;">$2</span></div></div>')
    .replace(/\\desc{(.*?)}/gs, '<div style="margin-top: 4px; padding-left: 20px; margin-bottom: 0.75rem;">$1</div>')
    .replace(/\\bullets{([\s\S]*?)}/gs, '<ul style="margin-left: 20px; padding-left: 0; list-style-type: disc; margin-top: 8px;">$1</ul>')
    .replace(/\\item/g, '<li style="margin-bottom: 6px;">')
    
    // Cleanup remaining formatting commands
    .replace(/\\hrule/g, '<hr />')
    .replace(/\\hfill/g, '')
    .replace(/\\textbf{(.*?)}/g, '<b>$1</b>')
    .replace(/\\bfseries/g, '')
    .replace(/\\scshape/g, '')
    .replace(/\\color{.*?}/g, '')
    .replace(/\\\\\[.*?\]/g, '<br/>')
    .replace(/\\vspace{.*?}/g, '')
    .replace(/\\\\/g, '<br/>')
    // Catch-all to remove any remaining simple commands or artifacts
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, ''); // Remove stray curly braces


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Preview</CardTitle>
        <CardDescription>A live preview of your resume. This is a web-based rendering, not a final PDF.</CardDescription>
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
