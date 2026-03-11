export interface TemplateMetadata {
  id: string
  name: string
  description: string
  whoItsFor: string
}

export const TEMPLATE_METADATA: Record<string, TemplateMetadata> = {
  experienced: {
    id: 'experienced',
    name: 'Professional',
    description: 'Experience-first layout for candidates with work history',
    whoItsFor: 'I have work experience or internships',
  },
  student: {
    id: 'student',
    name: 'Student',
    description: 'Education-first layout for fresh graduates and students',
    whoItsFor: 'I am a student or recent graduate',
  },
}
