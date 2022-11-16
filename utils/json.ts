export const isValidJson = (data: any) => {
  try {
    JSON.parse(data);

    return true;
  } catch (err) {
    return false;
  }
};
