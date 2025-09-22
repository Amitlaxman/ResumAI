
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

    // Replace structural commands with HTML-like tags for parsing
    .replace(/\\begin{center}([\s\S]*?)\\end{center}/gs, '<centerblock>$1</centerblock>')
    .replace(/\\resumeheader{(.*?)}/gs, '<resumeheader>$1</resumeheader>')
    .replace(/\\resumecontact{([\s\S]*?)}/gs, (match, content) => {
        const lines = content.replace(/\\\\/g, '').trim().split('$|$').map(s => s.trim());
        return `<resumecontact>${lines.join(' | ')}</resumecontact>`;
    })
    .replace(/\\section{(.*?)}/gs, '<sectiontitle>$1</sectiontitle>')
    .replace(/\\entry{(.*?)}{(.*?)}{([\s\S]*?)}{.*?}/gs, (match, left, right, body) => {
        const bullets = body.replace(/\\bullets{([\s\S]*?)}/gs, '<bullets>$1</bullets>')
                           .replace(/\\item/g, '<bulletitem>');
        return `<entry><left>${left}</left><right>${right}</right><body>${bullets}</body></entry>`;
    })
    .replace(/\\entry{(.*?)}{(.*?)}\s*{\s*\\textbf{(.*?)}\s*}\s*{(.*?)}\s*\\vspace{.*?}\s*\\desc{(.*?)}/gs,
        '<entry><left>$1</left><right>$4</right><body><degree>$3</degree><description>$5</description></body></entry>'
    )
    .replace(/\\singlelineentry{(.*?)}{([\s\S]*?)}/gs, '<singlelineentry><left>$1</left><right>$2</right></singlelineentry>')
    .replace(/\\bullets{([\s\S]*?)}/gs, '<bullets>$1</bullets>')
    .replace(/\\desc{(.*?)}/gs, '<description>$1</description>')
    .replace(/\\item/g, '<bulletitem>')
    
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

    // Convert custom tags to final HTML
    .replace(/<centerblock>([\s\S]*?)<\/centerblock>/g, '<div style="text-align: center;">$1</div>')
    .replace(/<resumeheader>(.*?)<\/resumeheader>/g, '<h1>$1</h1>')
    .replace(/<resumecontact>(.*?)<\/resumecontact>/g, '<p><small>$1</small></p>')
    .replace(/<sectiontitle>(.*?)<\/sectiontitle>/g, '<h2>$1</h2><hr/>')
    .replace(/<entry>([\s\S]*?)<\/entry>/g, '<div>$1</div>')
    .replace(/<left>(.*?)<\/left>/g, '<div style="display: flex; justify-content: space-between;"><b>$1</b>')
    .replace(/<right>(.*?)<\/right>/g, '<span>$1</span></div>')
    .replace(/<body>([\s\S]*?)<\/body>/g, '<div>$1</div>')
    .replace(/<bullets>([\s\S]*?)<\/bullets>/g, '<ul>$1</ul>')
    .replace(/<bulletitem>/g, '<li>')
    .replace(/<degree>(.*?)<\/degree>/g, '<div><b>$1</b></div>')
    .replace(/<description>(.*?)<\/description>/g, '<div>$1</div>')
    .replace(/<singlelineentry><left>(.*?)<\/left><right>(.*?)<\/right><\/singlelineentry>/g, '<div><div style="display: flex; justify-content: space-between;"><b>$1</b><span style="word-break: break-all;">$2</span></div></div>');


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
