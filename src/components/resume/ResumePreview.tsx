
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
    ?.replace(/\\documentclass\[.*?\]{.*?}/g, '')
    .replace(/\\usepackage{.*?}/g, '')
    .replace(/\\begin{document}/g, '')
    .replace(/\\end{document}/g, '')
    .replace(/\\pagestyle{.*?}/g, '')
    .replace(/\\newcounter{.*?}/g, '')
    .replace(/\\hypersetup{.*?}/g, '')
    .replace(/\\urlstyle{.*?}/g, '')
    .replace(/\\raggedbottom/g, '')
    .replace(/\\raggedright/g, '')
    .replace(/\\setlength{.*?}{.*?}/g, '')
    .replace(/\\hrule/g, '<hr/>')
    .replace(/\\hfill/g, '<span style="float: right;">') // This won't work as expected in all cases
    .replace(/\\bfseries/g, '')
    .replace(/\\scshape/g, '')
    .replace(/\\color{.*?}/g, '')
    .replace(/\\resumeheader{(.*?)}/g, '<h1>$1</h1>')
    .replace(/\\resumecontact{(.*?)}/g, '<p><small>$1</small></p>')
    .replace(/\\section{(.*?)}/g, '<h2>$1</h2><hr/>')
    .replace(/\\entry{(.*?)}{(.*?)}{((?:.|\n)*?)}{.*?}/g, '<div><b>$1</b><span style="float: right;">$2</span><br/>$3</div>')
    .replace(/\\singlelineentry{(.*?)}{(.*?)}/g, '<div><b>$1</b><span style="float: right;">$2</span></div>')
    .replace(/\\desc{(.*?)}/g, '<ul><li>$1</li></ul>')
    .replace(/\\bullets{((?:.|\n)*?)}/g, '<ul>$1</ul>')
    .replace(/\\item/g, '<li>')
    .replace(/\\end{itemize}/g, '</ul>')
    .replace(/\\begin{itemize}.*?\]/g, '<ul>')
    .replace(/\\\\\[.*?\]/g, '<br/>')
    .replace(/\\vspace{.*?}/g, '');


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
