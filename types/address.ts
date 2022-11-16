import { z } from 'zod';
import { requiredMessage } from '../utils/validator';

export const AddressInputSchema = z.object({
  street: z.string().trim().min(0, requiredMessage),
  houseNumber: z.string().trim().min(0, requiredMessage),
  postCode: z.string().trim().min(0, requiredMessage),
  city: z.string().trim().min(0, requiredMessage),
  country: z.string().trim().min(0, requiredMessage),
});

export type AddressInput = z.infer<typeof AddressInputSchema>;
