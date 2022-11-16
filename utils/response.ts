import { ValidationError } from '../types/validation';

export const successResponse = (data: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      ...data,
    }),
  };
};

export const validationResponse = (validation: ValidationError) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      errors: validation.errors,
    }),
  };
};

export const serverErrorResponse = (err: unknown) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      errors: [
        {
          code: 'server',
          message: err instanceof Error ? err.message : 'Something went wrong. :(',
        },
      ],
    }),
  };
};
