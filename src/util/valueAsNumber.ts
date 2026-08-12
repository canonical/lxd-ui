export const valueAsNumber = (value: string): number | undefined => {
  if (value === "") {
    return undefined;
  }
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return undefined;
  }
  return numberValue;
};
