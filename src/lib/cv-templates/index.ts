import { StructuredCV } from '@/features/cv-generator/types';
import { buildExperiencedTemplate } from './experienced';
import { buildStudentTemplate } from './student';
import { TEMPLATE_METADATA, TemplateMetadata } from './metadata';

export interface HardcodedTemplate extends TemplateMetadata {
  build: (cv: StructuredCV) => string
}

export const TEMPLATES: Record<string, HardcodedTemplate> = {
  experienced: {
    ...TEMPLATE_METADATA.experienced,
    build: buildExperiencedTemplate,
  },
  student: {
    ...TEMPLATE_METADATA.student,
    build: buildStudentTemplate,
  },
}

export function getTemplate(id: string): HardcodedTemplate {
  return TEMPLATES[id] || TEMPLATES['experienced'];
}
