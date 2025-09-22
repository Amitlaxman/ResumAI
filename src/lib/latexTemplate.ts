
export const latexTemplate = `
\\documentclass[a4paper,10pt]{article}
\\usepackage{charter}
\\usepackage[T1]{fontenc}
\\usepackage{latexsym}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{url}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{tabularx}
\\usepackage{hyperref}

\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=blue,
    pdftitle={Resume},
    pdfpagemode=FullScreen,
}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

%---- SECTIONING ----
\\newcounter{sec}
\\newcommand{\\section}[1]{
  \\refstepcounter{sec}
  \\par\\vspace{8.5pt}
  {\\Large\\bfseries\\scshape\\color{NavyBlue} #1}
  \\par\\vspace{2.5pt}
  \\hrule
  \\vspace{-2pt}
}

%---- CUSTOM COMMANDS ----
\\newcommand{\\resumeheader}[1]{ % Name
    {\\Huge\\bfseries\\color{NavyBlue} #1}
}
\\newcommand{\\resumecontact}[1]{ % Contact info
    {\\small #1}
}
\\newcommand{\\entry}[4]{ % {Left-aligned title} {Right-aligned title} {body} {spacing}
    \\parbox{\\textwidth}{
        {\\textbf{#1} \\hfill #2}
        \\ifx&#3&\\else
            \\\\[#4]
            #3
        \\fi
    }
}
\\newcommand{\\singlelineentry}[2]{ % {left} {right}
    \\parbox{\\textwidth}{
        {\\textbf{#1} \\hfill #2}
    }
}
\\newcommand{\\desc}[1]{
    \\begin{itemize}[leftmargin=*, nosep, itemsep=2pt, topsep=0pt, partopsep=0pt]
        \\item #1
    \\end{itemize}
}
\\newcommand{\\bullets}[1]{
    \\begin{itemize}[leftmargin=*, label=\\textbullet, nosep, itemsep=2pt, topsep=0pt, partopsep=0pt]
        #1
    \\end{itemize}
}


%---- DOCUMENT START ----
\\begin{document}
\\pagestyle{empty}

% The AI will fill in the content below using the profile and job description.
% Example structure is provided for guidance.

% \\begin{center}
%     \\resumeheader{YOUR NAME}
%     \\vspace{4pt}
%     \\resumecontact{
%         your.email@example.com $|$ 555-123-4567 $|$ your-website.com \\\\
%         linkedin.com/in/yourusername $|$ github.com/yourusername
%     }
% \\end{center}
% 
% 
% %-----------  SUMMARY  -----------
% \\section{Summary}
% A highly motivated and results-oriented software developer with over 5 years of experience...
% 
% 
% %----------- EXPERIENCE -----------
% \\section{Experience}
% 
% \\entry{Software Engineer, Awesome Inc.}{Cupertino, CA}
% {
%     \\bullets{
%         \\item Reduced time to render user buddy lists by 75\\% by implementing a prediction algorithm.
%         \\item Integrated iChat with Spotlight Search by creating a tool to extract metadata.
%     }
% }{2pt}
% \\vspace{8pt}
% 
% %----------- EDUCATION -----------
% \\section{Education}
% 
% \\entry{University of Pennsylvania}{Philadelphia, PA}
% {\\textbf{BS in Computer Science}}{Sept 2000 -- May 2005}
% \\vspace{2pt}
% \\desc{GPA: 3.9/4.0}
% 
% %----------- PROJECTS -----------
% \\section{Projects}
% 
% \\singlelineentry{My Awesome Project}{github.com/your/repo}
% \\bullets{
%     \\item Built a thing that does a thing and it was awesome.
% }

\\end{document}
`
