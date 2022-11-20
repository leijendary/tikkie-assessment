import { ValidationError } from '../types/validation';

export default class Response {
  static success(data: any) {
    const body = {
      ...data,
    };

    return this.status(body);
  }

  static validation(validation: ValidationError) {
    const body = {
      errors: validation.errors,
    };

    return this.status(body, 400);
  }

  static serverError(err: unknown) {
    const body = {
      errors: [
        {
          code: 'server',
          message: err instanceof Error ? err.message : 'Something went wrong. :(',
        },
      ],
    };

    return this.status(body, 500);
  }

  static status(body: unknown, statusCode: number = 200) {
    return {
      statusCode,
      body: JSON.stringify(body),
    };
  }
}
