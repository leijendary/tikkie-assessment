import { FieldError } from './types';

/**
 * TODO: "find a better way to validate."
 *
 * ...these todos are never done.
 *
 * BUT i do prefer using https://zod.dev/ for validation due to it's typescript inference and ease of use.
 * For simplicity, i'll use a simple validator.
 */
export const required = (name: string, fields: string[], object?: any): FieldError[] => {
  const errors = [] as FieldError[];

  if (!object) {
    errors.push({
      code: 'required',
      field: name,
      message: 'Required field',
    });

    return errors;
  }

  for (const field of fields) {
    if (!!object[field]?.trim()) continue;

    errors.push({
      code: 'required',
      field,
      message: 'Required field',
    });
  }

  return errors;
};
