
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

  // This is a temporary fix to handle unsupported LaTeX commands by react-latex-next
  // A more robust solution would be to use a different renderer or adjust the template
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

    // Replace structural commands with HTML
    .replace(/\\begin{center}([\s\S]*?)\\end{center}/gs, '<div style="text-align: center;">$1</div>')
    .replace(/\\resumeheader{(.*?)}/gs, '<h1>$1</h1>')
    .replace(/\\resumecontact{([\s\S]*?)}/gs, (match, content) => {
        const lines = content.replace(/\\\\/g, '').trim().split('$|$').map(s => s.trim());
        return `<p><small>${lines.join(' | ')}</small></p>`;
    })
    .replace(/\\section{(.*?)}/gs, '<h2>$1</h2><hr/>')
    
    // Handle entry with bullets
    .replace(/\\entry{(.*?)}{(.*?)}{([\s\S]*?)}{.*?}/gs, (match, left, right, body) => {
        const bullets = body.replace(/\\bullets{([\s\S]*?)}/gs, '<ul>$1</ul>')
                           .replace(/\\item/g, '<li>');
        return `<div><div style="display: flex; justify-content: space-between;"><b>${left}</b><span>${right}</span></div>${bullets}</div>`;
    })
    
    // Handle entry for education (with desc)
     .replace(/\\entry{(.*?)}{(.*?)}\s*{\s*\\textbf{(.*?)}\s*}\s*{(.*?)}\s*\\vspace{.*?}\s*\\desc{(.*?)}/gs,
        '<div><div style="display: flex; justify-content: space-between;"><b>$1</b><span>$4</span></div><div><b>$3</b></div><div>$5</div></div>'
    )
    
    .replace(/\\singlelineentry{(.*?)}{((?:.|\n)*?)}/gs, '<div><div style="display: flex; justify-content: space-between;"><b>$1</b><a href="$2" target="_blank" rel="noopener noreferrer">$2</a></div></div>')

    // General list handling
    .replace(/\\bullets{([\s\S]*?)}/gs, '<ul>$1</ul>')
    .replace(/\\desc{(.*?)}/gs, '<div>$1</div>')
    .replace(/\\item/g, '<li>')
    .replace(/\\end{itemize}/g, '</ul>')
    .replace(/\\begin{itemize}.*?\]/g, '<ul>')
    

    // Cleanup remaining formatting commands
    .replace(/\\hrule/g, '<hr/>')
    .replace(/\\hfill/g, '')
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
           <div className="prose prose-sm max-w-none">
             <Latex>{sanitizedLatex || ''}</Latex>
           </div>
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
