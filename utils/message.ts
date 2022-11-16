const message = {
  required: 'Required field',
};

type MessageKey = keyof typeof message;

export const getMessage = (key: MessageKey | null) => {
  if (!key) return '';

  return message[key] ?? key;
};
