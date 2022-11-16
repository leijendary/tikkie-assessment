import { z } from 'zod';
import { requiredMessage } from '../utils/validator';
import { AddressInputSchema } from './address';

export const PersonInputSchema = z.object({
  firstName: z.string().trim().min(1, requiredMessage),
  lastName: z.string().trim().min(1, requiredMessage),
  phoneNumber: z.string().trim().min(1, requiredMessage),
  address: AddressInputSchema,
});

export type PersonInput = z.infer<typeof PersonInputSchema>;
