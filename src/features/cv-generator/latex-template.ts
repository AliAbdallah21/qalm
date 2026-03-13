import { StructuredCV, CVExperience, CVSkillCategory, CVCertificate, CVEducation, CVProject } from './types';
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

export function buildExperienceLatex(experience: CVExperience[]): string {
  if (!experience || experience.length === 0) return '';
  return `\\section{Professional Experience}\n` + experience.map(exp => `
\\customcventry{${escapeLatex(exp.start_date)} ‐ ${escapeLatex(exp.end_date)}}{{\\color{blue}{${escapeLatex(exp.company)}}}}{${escapeLatex(exp.title)}}{}{}{
\\begin{itemize}[leftmargin=0.6cm, label={\\textbullet}]
${exp.bullets.map(b => `\\item ${escapeLatex(b)}`).join('\n')}
\\end{itemize}}`).join('\n');
}

export function buildSkillsLatex(skills: { categories: CVSkillCategory[] }): string {
  if (!skills || !skills.categories || skills.categories.length === 0) return '';
  return `\\section{Skills}\n\\begin{itemize}[label=\\textbullet]\n    ${skills.categories.map(cat => `\\item \\textbf{${escapeLatex(cat.name)}:} ${escapeLatex(cat.skills.join(', '))}.`).join('\n    ')}\n\\end{itemize}`;
}

export function buildCertificatesLatex(certificates: CVCertificate[]): string {
  if (!certificates || certificates.length === 0) return '';
  return `\\section{Certifications}\n` + certificates.map(cert => {
    const displayText = cert.description 
      ? (cert.description.length > 120 ? cert.description.substring(0, 117) + '...' : cert.description)
      : cert.date;
      
    // Format: Title, Issuer: Description (or Date) — NO BULLETS
    return `\\certcventry{${cert.url || 'https://github.com'}}{${escapeLatex(cert.title)}}{${escapeLatex(cert.issuer)}}{${escapeLatex(displayText)}}`;
  }).join('\n');
}

export function buildEducationLatex(education: CVEducation[], location: string): string {
  if (!education || education.length === 0) return '';
  return `\\section{Education}\n` + education.map(edu => `
\\customcventry{${escapeLatex(edu.dates)}}{{\\color{blue}{${escapeLatex(edu.institution)}}}}{${escapeLatex(edu.degree)}, ${escapeLatex(edu.field)}}{${escapeLatex(location?.split(',')[0] || '')}}{}{}
`).join('\n');
}

export function buildProjectsLatex(projects: CVProject[]): string {
  if (!projects || projects.length === 0) return '';
  return `\\section{Projects}\n{\\begin{itemize}[label=\\textbullet]\n${projects.map(proj => `
\\item {\\textbf{\\href{${proj.url || 'https://github.com'}}{${escapeLatex(proj.name)}}:} ${escapeLatex(proj.description)}}`).join('\n')}\n\\end{itemize}}`;
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

${buildExperienceLatex(experience)}

${buildSkillsLatex(skills)}

${buildCertificatesLatex(certificates)}

${buildEducationLatex(education, header.location)}

${buildProjectsLatex(projects)}

\\end{document}
`;

  return tex;
}

export function buildLatexString(cvData: StructuredCV): string {
  return buildLatexCV(cvData);
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

export function injectIntoTemplate(template: string, cv: StructuredCV): string {
  let result = template;

  const escapedName = escapeLatex(cv.header.name);
  const escapedEmail = escapeLatex(cv.header.email);
  const escapedPhone = escapeLatex(cv.header.phone);
  const escapedLocation = escapeLatex(cv.header.location);
  const escapedLinkedin = escapeLatex(cv.header.linkedin);
  const escapedGithub = escapeLatex(cv.header.github);

  const summaryLatex = cv.header.title ? `\\section{Summary}\n${escapeLatex(cv.header.title)}` : '';

  result = result.replace(/\{\{NAME\}\}/g, escapedName);
  result = result.replace(/\{\{EMAIL\}\}/g, escapedEmail);
  result = result.replace(/\{\{PHONE\}\}/g, escapedPhone);
  result = result.replace(/\{\{LOCATION\}\}/g, escapedLocation);
  result = result.replace(/\{\{LINKEDIN\}\}/g, escapedLinkedin);
  result = result.replace(/\{\{GITHUB\}\}/g, escapedGithub);
  result = result.replace(/\{\{SUMMARY\}\}/g, summaryLatex);

  result = result.replace(/\{\{EXPERIENCE\}\}/g, buildExperienceLatex(cv.experience));
  result = result.replace(/\{\{EDUCATION\}\}/g, buildEducationLatex(cv.education, cv.header.location));
  result = result.replace(/\{\{SKILLS\}\}/g, buildSkillsLatex(cv.skills));
  result = result.replace(/\{\{PROJECTS\}\}/g, buildProjectsLatex(cv.projects));
  result = result.replace(/\{\{CERTIFICATES\}\}/g, buildCertificatesLatex(cv.certificates));

  return result;
}
