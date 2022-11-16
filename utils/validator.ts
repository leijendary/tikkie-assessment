import { ZodSchema } from 'zod';
import { ValidationResult } from '../types/validation';
import { isValidJson } from './json';
import { getMessage } from './message';

export const requiredMessage = {
  message: getMessage('required'),
};

export const validate = async <T>(json: string | null, schema: ZodSchema): Promise<ValidationResult<T>> => {
  if (!isValidJson(json)) {
    json = null;
  }

  if (!json) {
    return {
      success: false,
      errors: [
        {
          code: 'invalid_type',
          expected: 'object',
          received: 'undefined',
          path: ['body'],
          ...requiredMessage,
        },
      ],
    };
  }

  const input = JSON.parse(json) as T;
  const result = await schema.safeParseAsync(input);

  if (!result.success) {
    return {
      ...result,
      errors: result.error.errors,
    };
  }

  return result;
};
