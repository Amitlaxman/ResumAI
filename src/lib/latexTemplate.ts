

export const latexTemplate = `
\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{url}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{charter}
\\usepackage[T1]{fontenc}
\\usepackage{tabularx}
\\usepackage{hyperref}
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=blue,
    pdftitle={Your Name - Resume},
    pdfpagemode=FullScreen,
}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\newlist{innerlist}{itemize}{1}
\\setlist[innerlist]{label=\\textbullet, leftmargin=*, nosep, partopsep=0pt, topsep=0pt}


%---- FONT MAPPING ----
%\\usepackage{fontspec}
%\\setmainfont{Georgia}

%---- SECTIONING ----
\\newcounter{sec}
\\newcommand{\\section}[1]{
  \\refstepcounter{sec}
  \\par\\vspace{8.5pt}
  {\\Large\\bfseries #1}
  \\par\\vspace{8.5pt}
  \\hrule
  \\vspace{8pt}
}

%---- CUSTOM COMMANDS ----
\\newcommand{\\resumeheader}[1]{ % Name
    {\\Huge\\bfseries #1}
}
\\newcommand{\\resumecontact}[1]{ % Contact info
    {\\large #1}
}
\\newcommand{\\entry}[4]{ % {Left-aligned} {Right-aligned} {body} {spacing}
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
    \\begin{itemize}[leftmargin=*, nosep]
        \\item #1
    \\end{itemize}
}
\\newcommand{\\bullets}[1]{
    \\begin{itemize}[leftmargin=*, nosep]
        #1
    \\end{itemize}
}


%---- DOCUMENT START ----
\\begin{document}
\\begin{center}
    \\resumeheader{YOUR NAME}
    \\vspace{12pt}
    {\\large
        your.email@example.com $|$ 555-123-4567 $|$ your-website.com \\\\
        linkedin.com/in/yourusername $|$ github.com/yourusername
    }
\\end{center}


%-----------  SUMMARY  -----------
\\section{Summary}

A highly motivated and results-oriented software developer with over 5 years of experience in building and maintaining web applications. Proficient in JavaScript, React, and Node.js. Passionate about creating clean, efficient, and user-friendly code.


%----------- EXPERIENCE -----------
\\section{Experience}

\\entry{Software Engineer, Apple}{Cupertino, CA}
{
    \\bullets{
        \\item Reduced time to render user buddy lists by 75\\% by implementing a prediction algorithm.
        \\item Integrated iChat with Spotlight Search by creating a tool to extract metadata from saved chat transcripts and provide metadata to a system-wide search database.
        \\item Redesigned chat file format and implemented backward compatibility for search.
    }
}{0pt}
\\vspace{8pt}

\\entry{Software Engineer Intern, Microsoft}{Redmond, WA}
{
    \\bullets{
        \\item Designed a UI for the VS open file switcher (Ctrl-Tab) and extended it to tool windows.
        \\item Created a service to provide gradient across VS and VS add-ins, optimizing its performance via caching.
        \\item Built an app to compute the similarity of all methods in a codebase, reducing the time from O(n\\texttwosuperior) to O(n log n).
    }
}{0pt}
\\vspace{8pt}

%----------- EDUCATION -----------
\\section{Education}

\\entry{University of Pennsylvania}{Philadelphia, PA}
{\\textbf{BS in Computer Science}}{Sept 2000 -- May 2005}
\\vspace{4pt}
\\desc{GPA: 3.9/4.0}

%----------- PROJECTS -----------
\\section{Projects}

\\singlelineentry{My Awesome Project}{github.com/your/repo}
\\bullets{
    \\item Built a thing that does a thing and it was awesome.
    \\item Used React, Node.js, and a whole lot of coffee.
}
\\vspace{8pt}

\\singlelineentry{Another Cool Thing}{github.com/your/other-repo}
\\bullets{
    \\item Did some other stuff that was also pretty cool.
    \\item Leveraged AI and Machine Learning to predict the future.
}


% This is where the generated resume content will be inserted.
% The AI will replace this comment with the user's profile and job description,
% formatted using the LaTeX commands defined above.
{{{resumeContent}}}


\\end{document}
`

