import { z } from 'zod';

export const visitSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(100, 'Client name too long'),
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
  projectNo: z.string().min(1, 'Project No. is required').max(50, 'Project No. too long'),
  visitDate: z.string().min(1, 'Visit date is required'),
  preparedBy: z.string().min(1, 'Prepared by is required').max(100, 'Prepared by too long'),
});

export const photoSchema = z.object({
  description: z.string().max(200, 'Description too long'),
  notes: z.string().max(500, 'Notes too long'),
});

export type VisitFormData = z.infer<typeof visitSchema>;
export type PhotoFormData = z.infer<typeof photoSchema>;