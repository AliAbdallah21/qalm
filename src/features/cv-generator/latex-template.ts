import { StructuredCV } from './types';
import latex from 'node-latex';

/**
 * Escapes special LaTeX characters in a string.
 */
function escapeLatex(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash ')
    .replace(/&/g, '\\&')
    .replace(/\$/g, '\\$')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde ')
    .replace(/\^/g, '\\textasciicircum ');
}

export function buildLatexCV(cvData: StructuredCV): string {
  console.log('TITLE GOING INTO LATEX:', cvData.header.title)
  const { header, experience, education, skills, projects, certificates } = cvData;

  const firstName = header.name.split(' ')[0] || '';
  const lastName = header.name.split(' ').slice(1).join(' ') || '';

  let tex = `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{black}
\\makeatletter
\\renewcommand*{\\makecvtitle}{%
  \\recomputecvlengths%
  \\begin{minipage}[t]{\\maincolumnwidth}%
    {\\Huge\\bfseries\\color{black}\\@firstname\\ \\@lastname}%
    \\ifthenelse{\\isundefined{\\@title}}{}{%
      \\hspace{1em}{\\Large\\bfseries\\color{black}\\@title}}%
  \\end{minipage}%
  \\par\\vspace{1em}%
}
\\makeatother\\nopagenumbers{}
\\usepackage[utf8]{inputenc}
\\usepackage{ragged2e}
\\usepackage[scale=0.92]{geometry}
\\usepackage{import}
\\usepackage{multicol}
\\usepackage{enumitem}
\\usepackage{amssymb}
\\setlength{\\parskip}{0pt}
\\setlength{\\itemsep}{1pt}
\\setlength{\\parsep}{0pt}
\\name{${escapeLatex(firstName)}}{${escapeLatex(lastName)}}

\\newcommand*{\\customcventry}[7][.13em]{
\\begin{tabular}{@{}l}
{\\bfseries #4} \\\\
{\\itshape #3}
\\end{tabular}
\\hfill
\\begin{tabular}{l@{}}
{\\bfseries #5} \\\\
{\\itshape #2}
\\end{tabular}
\\ifx&#7&%
\\else{\\
\\begin{minipage}{\\maincolumnwidth}%
\\small#7%
\\end{minipage}}\\fi%
\\par\\addvspace{#1}}

\\newcommand*{\\certcventry}[5][.13em]{
  \\begin{tabular*}{\\maincolumnwidth}{@{}l@{\\extracolsep{\\fill}}r}
    \\textbf{#3} & \\textbf{\\color{blue}\\href{#2}{#4}} \\\\
  \\end{tabular*}
  \\ifx&#5&%
  \\else{%
  \\begin{minipage}{\\maincolumnwidth}%
  \\small#5%
  \\end{minipage}}\\fi%
  \\par\\addvspace{#1}}

\\begin{document}

\\vspace{-6mm}

\\begin{center}
{\\Huge\\bfseries\\color{black} ${escapeLatex(header.name)}}

\\vspace{2mm}

{\\Large\\bfseries\\color{black} ${escapeLatex(header.title)}}

\\vspace{4mm}

\\begin{tabular}{ c c c }
\\faMobile\\enspace ${escapeLatex(header.phone)} &
\\faEnvelope\\enspace ${escapeLatex(header.email)} &
${header.github ? `\\faGithub\\enspace \\color{blue}\\href{${header.github}}{GitHub}` : ''} \\\\
\\multicolumn{3}{c}{
${header.linkedin ? `\\faLinkedin\\enspace \\color{blue}\\href{${header.linkedin}}{LinkedIn}` : ''}
}
\\end{tabular}
\\end{center}

\\vspace{4mm}

\\section{Professional Experience}
${experience.map(exp => `
\\customcventry{${escapeLatex(exp.start_date)} ‐ ${escapeLatex(exp.end_date)}}{{\\color{blue}{${escapeLatex(exp.company)}}}}{${escapeLatex(exp.title)}}{}{}{
\\begin{itemize}[leftmargin=0.6cm, label={\\textbullet}]
${exp.bullets.map(b => `\\item ${escapeLatex(b)}`).join('\n')}
\\end{itemize}}`).join('\n')}

\\section{Skills}
\\begin{itemize}[label=\\textbullet]
    ${skills.categories.map(cat => `\\item \\textbf{${escapeLatex(cat.name)}:} ${escapeLatex(cat.skills.join(', '))}.`).join('\n    ')}
\\end{itemize}

\\section{Certifications}
${certificates.map(cert => `
\\certcventry{${cert.url || 'https://github.com'}}{${escapeLatex(cert.title)}}{${escapeLatex(cert.issuer)}}{
\\begin{itemize}[leftmargin=0.6cm, label={\\textbullet}]
\\item ${escapeLatex(cert.date)}
\\end{itemize}}`).join('\n')}

\\section{Education}
${education.map(edu => `
\\customcventry{${escapeLatex(edu.dates)}}{{\\color{blue}{${escapeLatex(edu.institution)}}}}{${escapeLatex(edu.degree)}, ${escapeLatex(edu.field)}}{${escapeLatex(header.location.split(',')[0])}}{}{}
`).join('\n')}

\\section{Projects}
{\\begin{itemize}[label=\\textbullet]
${projects.map(proj => `
\\item {\\textbf{\\href{${proj.url || 'https://github.com'}}{${escapeLatex(proj.name)}}:} ${escapeLatex(proj.description)}}`).join('\n')}
\\end{itemize}}

\\end{document}
`;

  return tex;
}

export async function generateLatexCVPdf(cvData: StructuredCV): Promise<Buffer> {
  const texContent = buildLatexCV(cvData);
  const stream = latex(texContent);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
