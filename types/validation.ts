import { ZodIssue } from 'zod';

export type ValidationSuccess<T> = {
  data: T;
  success: true;
};

export type ValidationError = {
  success: false;
  errors: ZodIssue[];
};

export type ValidationResult<T> = ValidationError | ValidationSuccess<T>;
